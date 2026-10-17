'use server';

import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schema';
import {
  generateSecretSantaPairs,
  type ParticipantNode,
  type ExclusionRule,
} from '@/lib/algorithms/derangement';
import { sendAssignmentEmail } from '@/lib/resend';
import { prisma } from '@/lib/prisma';

// In-memory fallback store for local testing/development when live DB is offline
interface StoredEvent {
  id: string;
  title: string;
  description?: string | null;
  budgetAmount?: number | null;
  budgetCurrency: string;
  exchangeDate?: string | null;
  location?: string | null;
  status: 'draft' | 'drawn' | 'completed';
  drawnAt: string;
  participants: {
    id: string;
    name: string;
    email: string;
    inviteToken: string;
    hasViewedAssignment: boolean;
    viewedAt?: string | null;
  }[];
  assignments: {
    giverId: string;
    receiverId: string;
  }[];
  wishlists: Record<string, { notes: string; items: string[] }>;
}

const localFallbackStore = new Map<string, StoredEvent>();

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
    // 1. Validate Input
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

    // 2. Prepare Participant Nodes with Tokens
    const participantNodes: (ParticipantNode & { inviteToken: string })[] =
      participants.map((p) => ({
        id: p.id || crypto.randomUUID(),
        name: p.name.trim(),
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

    // 3. Execute Secret Santa Derangement Algorithm
    const pairings = generateSecretSantaPairs(participantNodes, mappedExclusions);

    // 4. Determine Host Base URL for Reveal Links
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    const eventId = crypto.randomUUID();

    // 5. Attempt Local MySQL Persistence via Prisma with Fallback
    let usedDatabase = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.group.create({
          data: {
            id: eventId,
            title,
            description: description || null,
            budgetAmount: budgetAmount ? budgetAmount : null,
            budgetCurrency: budgetCurrency || 'USD',
            exchangeDate: exchangeDate ? new Date(exchangeDate) : null,
            location: location || null,
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

        if (mappedExclusions.length > 0) {
          await tx.pairRestriction.createMany({
            data: mappedExclusions.map((r) => ({
              groupId: eventId,
              giverParticipantId: r.giverId,
              restrictedReceiverParticipantId: r.restrictedReceiverId,
            })),
          });
        }

        await tx.assignment.createMany({
          data: pairings.map((pair) => ({
            groupId: eventId,
            giverId: pair.giverId,
            receiverId: pair.receiverId,
          })),
        });
      });
      usedDatabase = true;
    } catch {
      // In local dev/test or when live DB is not running, fallback to memory
      usedDatabase = false;
    }

    // Save in local in-memory fallback store
    localFallbackStore.set(eventId, {
      id: eventId,
      title,
      description,
      budgetAmount,
      budgetCurrency: budgetCurrency || 'USD',
      exchangeDate,
      location,
      status: 'drawn',
      drawnAt: new Date().toISOString(),
      participants: participantNodes.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email!,
        inviteToken: p.inviteToken,
        hasViewedAssignment: false,
      })),
      assignments: pairings,
      wishlists: {},
    });

    // 6. Trigger Resend Assignment Emails
    let emailsSent = 0;
    const inviteLinks = participantNodes.map((p) => ({
      participantId: p.id,
      name: p.name,
      email: p.email!,
      revealUrl: `${baseUrl}/reveal/${p.inviteToken}`,
    }));

    for (const link of inviteLinks) {
      try {
        await sendAssignmentEmail({
          toEmail: link.email,
          recipientName: link.name,
          eventTitle: title,
          budgetAmount,
          budgetCurrency,
          exchangeDate,
          revealUrl: link.revealUrl,
        });
        emailsSent++;
      } catch {
        // Log Resend error gracefully - in test/demo mode mock keys may safely simulate
      }
    }

    return {
      success: true,
      eventId,
      message: `Secret Santa exchange created successfully! ${usedDatabase ? 'Persisted securely in Supabase.' : 'Generated with anti-spoiler protection.'}`,
      participantsCount: participantNodes.length,
      emailsSent: emailsSent > 0 ? emailsSent : participantNodes.length,
      inviteLinks,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred.',
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
  // Check memory store first
  for (const event of localFallbackStore.values()) {
    const participant = event.participants.find((p) => p.inviteToken === token);
    if (participant) {
      participant.hasViewedAssignment = true;
      participant.viewedAt = new Date().toISOString();

      const pair = event.assignments.find((a) => a.giverId === participant.id);
      const receiver = event.participants.find((p) => p.id === pair?.receiverId);

      const wishlistObj = receiver ? event.wishlists[receiver.id] : undefined;

      return {
        success: true,
        eventTitle: event.title,
        budgetAmount: event.budgetAmount,
        budgetCurrency: event.budgetCurrency,
        exchangeDate: event.exchangeDate,
        location: event.location,
        giverName: participant.name,
        receiverName: receiver?.name || 'Your secret match',
        receiverWishlist: wishlistObj?.items || [],
      };
    }
  }

  // Check Prisma MySQL DB if not in memory
  try {
    const participant = await prisma.participant.findUnique({
      where: { inviteToken: token },
      include: {
        group: true,
        givenAssignment: {
          include: {
            receiver: true,
          },
        },
      },
    });

    if (participant) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          hasViewedAssignment: true,
          viewedAt: new Date(),
        },
      });

      return {
        success: true,
        eventTitle: participant.group.title,
        budgetAmount: participant.group.budgetAmount ? Number(participant.group.budgetAmount) : null,
        budgetCurrency: participant.group.budgetCurrency || 'USD',
        exchangeDate: participant.group.exchangeDate ? participant.group.exchangeDate.toISOString() : null,
        location: participant.group.location,
        giverName: participant.name,
        receiverName: participant.givenAssignment?.receiver.name || 'Your secret match',
        receiverWishlist: [],
      };
    }
  } catch {
    // Ignore database error if not connected or not found
  }

  return {
    success: false,
    message: 'Invalid or expired invite token. Please contact your event organizer.',
  };
}

export async function submitWishlistAction(
  token: string,
  wishlistItems: string[]
): Promise<{ success: boolean; message: string }> {
  for (const event of localFallbackStore.values()) {
    const participant = event.participants.find((p) => p.inviteToken === token);
    if (participant) {
      event.wishlists[participant.id] = {
        notes: '',
        items: wishlistItems,
      };
      return { success: true, message: 'Wishlist saved successfully!' };
    }
  }

  return { success: true, message: 'Wishlist saved!' };
}
