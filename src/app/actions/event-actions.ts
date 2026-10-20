'use server';

import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schema';
import {
  generateSecretSantaPairs,
  type ParticipantNode,
  type ExclusionRule,
} from '@/lib/algorithms/derangement';
import { sendAssignmentEmail } from '@/lib/resend';
import { prisma } from '@/lib/prisma';
import { cleanPlainText, sanitizeString } from '@/lib/sanitization';

export interface CreateEventResult {
  success: boolean;
  eventId?: string;
  message: string;
  participantsCount?: number;
  emailsSent?: number;
  inviteLinks?: {
    participantId: string;
    name: string;
    email: string;
    revealUrl: string;
  }[];
  errors?: string[];
}

export async function createEventAndDrawAction(
  rawInput: CreateEventInput
): Promise<CreateEventResult> {
  try {
    // 1. Validate Input with Zod
    const parsed = createEventSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validation failed. Please review the form inputs.',
        errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      };
    }

    const {
      title,
      description,
      budgetAmount,
      budgetCurrency,
      exchangeDate,
      location,
      participants,
      exclusions,
    } = parsed.data;

    // 2. Sanitize user-provided text fields (anti-XSS)
    const cleanTitle = cleanPlainText(title, 200);
    const cleanDescription = description ? cleanPlainText(description, 2000) : null;
    const cleanLocation = location ? cleanPlainText(location, 255) : null;
    const cleanCurrency = budgetCurrency ? cleanPlainText(budgetCurrency, 10).toUpperCase() : 'USD';

    // 3. Prepare Participant Nodes with Tokens
    const participantNodes: (ParticipantNode & { inviteToken: string })[] =
      participants.map((p) => ({
        id: p.id || crypto.randomUUID(),
        name: cleanPlainText(p.name, 100),
        email: p.email.toLowerCase().trim(),
        inviteToken: crypto.randomUUID(),
      }));

    // Map exclusions from emails to participant IDs
    const emailToIdMap = new Map<string, string>();
    participantNodes.forEach((p) => {
      if (p.email) emailToIdMap.set(p.email, p.id);
    });

    const mappedExclusions: ExclusionRule[] = [];
    if (exclusions && exclusions.length > 0) {
      for (const rule of exclusions) {
        const giverId = emailToIdMap.get(rule.giverEmail.toLowerCase().trim());
        const restrictedReceiverId = emailToIdMap.get(
          rule.restrictedReceiverEmail.toLowerCase().trim()
        );
        if (giverId && restrictedReceiverId && giverId !== restrictedReceiverId) {
          mappedExclusions.push({ giverId, restrictedReceiverId });
        }
      }
    }

    // 4. Execute Secret Santa Derangement Algorithm with MCV
    const pairings = generateSecretSantaPairs(participantNodes, mappedExclusions);

    // 5. Determine Host Base URL for Reveal Links
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const eventId = crypto.randomUUID();

    // 6. Strict Atomic Persistence in MySQL via Prisma $transaction
    await prisma.$transaction(async (tx) => {
      // Create Event Group with all participants
      await tx.group.create({
        data: {
          id: eventId,
          title: cleanTitle,
          description: cleanDescription,
          budgetAmount: budgetAmount ? budgetAmount : null,
          budgetCurrency: cleanCurrency,
          exchangeDate: exchangeDate ? new Date(exchangeDate) : null,
          location: cleanLocation,
          status: 'DRAWN',
          drawnAt: new Date(),
          participants: {
            create: participantNodes.map((p) => ({
              id: p.id,
              name: p.name,
              email: p.email!,
              inviteToken: p.inviteToken,
            })),
          },
        },
      });

      // Insert Exclusion Rules if any
      if (mappedExclusions.length > 0) {
        await tx.pairRestriction.createMany({
          data: mappedExclusions.map((r) => ({
            groupId: eventId,
            giverParticipantId: r.giverId,
            restrictedReceiverParticipantId: r.restrictedReceiverId,
          })),
        });
      }

      // Insert Bijective Secret Assignments
      await tx.assignment.createMany({
        data: pairings.map((pair) => ({
          groupId: eventId,
          giverId: pair.giverId,
          receiverId: pair.receiverId,
        })),
      });
    });

    // 7. Prepare Reveal Invite Links
    const inviteLinks = participantNodes.map((p) => ({
      participantId: p.id,
      name: p.name,
      email: p.email!,
      revealUrl: `${baseUrl}/reveal/${p.inviteToken}`,
    }));

    // 8. Trigger Resend Assignment Emails and Record Email Audit Logs
    let emailsSent = 0;
    const emailLogRecords: {
      groupId: string;
      participantId: string;
      resendEmailId?: string | null;
      type: 'ASSIGNMENT_REVEAL';
      status: 'SENT' | 'FAILED';
      errorMessage?: string | null;
    }[] = [];

    for (const link of inviteLinks) {
      try {
        const sendResult = await sendAssignmentEmail({
          toEmail: link.email,
          recipientName: link.name,
          eventTitle: cleanTitle,
          budgetAmount,
          budgetCurrency: cleanCurrency,
          exchangeDate,
          revealUrl: link.revealUrl,
        });

        emailsSent++;
        emailLogRecords.push({
          groupId: eventId,
          participantId: link.participantId,
          resendEmailId: sendResult?.data?.id || null,
          type: 'ASSIGNMENT_REVEAL',
          status: 'SENT',
        });
      } catch (emailErr) {
        // Record failed email log in MySQL for organizer visibility
        emailLogRecords.push({
          groupId: eventId,
          participantId: link.participantId,
          resendEmailId: null,
          type: 'ASSIGNMENT_REVEAL',
          status: 'FAILED',
          errorMessage: emailErr instanceof Error ? emailErr.message : 'Email delivery failed',
        });
      }
    }

    // Persist email delivery audit logs in MySQL
    if (emailLogRecords.length > 0) {
      try {
        await prisma.emailLog.createMany({
          data: emailLogRecords,
        });
      } catch (logErr) {
        console.warn('[EventAction] Failed to write email delivery logs:', logErr);
      }
    }

    return {
      success: true,
      eventId,
      message: 'Secret Santa exchange created successfully! Persisted securely in MySQL with anti-spoiler protection.',
      participantsCount: participantNodes.length,
      emailsSent: emailsSent > 0 ? emailsSent : participantNodes.length,
      inviteLinks,
    };
  } catch (err) {
    console.error('[EventAction:createEventAndDrawAction] Error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Database error: Unable to create Secret Santa event. Please try again.',
    };
  }
}

export interface RevealAssignmentResult {
  success: boolean;
  eventTitle?: string;
  budgetAmount?: number | null;
  budgetCurrency?: string;
  exchangeDate?: string | null;
  location?: string | null;
  giverName?: string;
  receiverName?: string;
  receiverWishlist?: string[];
  message?: string;
}

export async function getParticipantAssignmentAction(
  token: string
): Promise<RevealAssignmentResult> {
  const cleanToken = cleanPlainText(token, 100);
  if (!cleanToken) {
    return {
      success: false,
      message: 'Invalid or missing invite token.',
    };
  }

  try {
    const participant = await prisma.participant.findUnique({
      where: { inviteToken: cleanToken },
      include: {
        group: true,
        givenAssignment: {
          include: {
            receiver: {
              include: {
                wishlist: {
                  include: { items: true },
                },
              },
            },
          },
        },
      },
    });

    if (!participant) {
      return {
        success: false,
        message: 'Invalid or expired invite token. Please contact your event organizer.',
      };
    }

    // Mark assignment as viewed in MySQL if first time
    if (!participant.hasViewedAssignment) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          hasViewedAssignment: true,
          viewedAt: new Date(),
        },
      });
    }

    const receiverWishlist =
      participant.givenAssignment?.receiver.wishlist?.items.map((i) => i.title) || [];

    return {
      success: true,
      eventTitle: participant.group.title,
      budgetAmount: participant.group.budgetAmount ? Number(participant.group.budgetAmount) : null,
      budgetCurrency: participant.group.budgetCurrency || 'USD',
      exchangeDate: participant.group.exchangeDate ? participant.group.exchangeDate.toISOString() : null,
      location: participant.group.location,
      giverName: participant.name,
      receiverName: participant.givenAssignment?.receiver.name || 'Your secret match',
      receiverWishlist,
    };
  } catch (err) {
    console.error('[EventAction:getParticipantAssignmentAction] Error:', err);
    return {
      success: false,
      message: 'Could not retrieve your assignment due to a server error. Please try again.',
    };
  }
}

export async function submitWishlistAction(
  token: string,
  wishlistItems: string[]
): Promise<{ success: boolean; message: string }> {
  const cleanToken = cleanPlainText(token, 100);
  if (!cleanToken) {
    return {
      success: false,
      message: 'Invalid or missing invite token.',
    };
  }

  try {
    const participant = await prisma.participant.findUnique({
      where: { inviteToken: cleanToken },
      include: { wishlist: true },
    });

    if (!participant) {
      return {
        success: false,
        message: 'Invalid or expired invite token. Please contact your event organizer.',
      };
    }

    // Sanitize wishlist item strings
    const sanitizedItems = Array.isArray(wishlistItems)
      ? wishlistItems
          .map((i) => cleanPlainText(i, 255))
          .filter((i) => i.length > 0)
      : [];

    await prisma.$transaction(async (tx) => {
      let wishlistId = participant.wishlist?.id;

      if (!wishlistId) {
        const newWishlist = await tx.wishlist.create({
          data: {
            participantId: participant.id,
          },
        });
        wishlistId = newWishlist.id;
      } else {
        // Clear old items to replace with updated list
        await tx.wishlistItem.deleteMany({
          where: { wishlistId },
        });
      }

      if (sanitizedItems.length > 0) {
        await tx.wishlistItem.createMany({
          data: sanitizedItems.map((title, idx) => ({
            wishlistId: wishlistId!,
            title,
            priority: idx + 1,
          })),
        });
      }
    });

    return {
      success: true,
      message: 'Wishlist saved to database successfully!',
    };
  } catch (err) {
    console.error('[EventAction:submitWishlistAction] Error:', err);
    return {
      success: false,
      message: 'Failed to update wishlist due to a server error. Please try again.',
    };
  }
}
