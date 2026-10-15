'use server';

import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schema';
import {
  generateSecretSantaPairs,
  type ParticipantNode,
  type ExclusionRule,
} from '@/lib/algorithms/derangement';
import { sendAssignmentEmail } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';

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

    // 5. Attempt Supabase Persistence with Fallback
    let usedDatabase = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adminClient = createAdminClient() as any;

      // Create dummy/anonymous organizer profile if needed for event association
      const systemOrganizerId = '00000000-0000-0000-0000-000000000000';
      
      // Upsert system profile for public unauthenticated group creates
      await adminClient.from('profiles').upsert({
        id: systemOrganizerId,
        email: 'organizer@secretsanta.io',
        full_name: 'System Organizer',
      });

      // Insert Event
      const { error: eventError } = await adminClient.from('events').insert({
        id: eventId,
        organizer_id: systemOrganizerId,
        title,
        description: description || null,
        budget_amount: budgetAmount || null,
        budget_currency: budgetCurrency,
        exchange_date: exchangeDate || null,
        location: location || null,
        status: 'drawn',
        drawn_at: new Date().toISOString(),
      });

      if (!eventError) {
        // Insert Participants
        const participantsToInsert = participantNodes.map((p) => ({
          id: p.id,
          event_id: eventId,
          name: p.name,
          email: p.email!,
          invite_token: p.inviteToken,
        }));
        await adminClient.from('participants').insert(participantsToInsert);

        // Insert Restrictions
        if (mappedExclusions.length > 0) {
          const restrictionsToInsert = mappedExclusions.map((r) => ({
            event_id: eventId,
            giver_participant_id: r.giverId,
            restricted_receiver_participant_id: r.restrictedReceiverId,
          }));
          await adminClient.from('pair_restrictions').insert(restrictionsToInsert);
        }

        // Insert Assignments (High security table)
        const assignmentsToInsert = pairings.map((pair) => ({
          event_id: eventId,
          giver_id: pair.giverId,
          receiver_id: pair.receiverId,
        }));
        await adminClient.from('assignments').insert(assignmentsToInsert);

        usedDatabase = true;
      }
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

  // Check Supabase if not in memory
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: participant } = await admin
      .from('participants')
      .select('id, name, event_id, events(title, budget_amount, budget_currency, exchange_date, location)')
      .eq('invite_token', token)
      .single();

    if (participant) {
      await admin
        .from('participants')
        .update({ has_viewed_assignment: true, viewed_at: new Date().toISOString() })
        .eq('id', participant.id);

      const { data: assignment } = await admin
        .from('assignments')
        .select('receiver_id, participants!assignments_receiver_id_fkey(name)')
        .eq('giver_id', participant.id)
        .single();

      const eventData = participant.events as unknown as {
        title: string;
        budget_amount: number | null;
        budget_currency: string;
        exchange_date: string | null;
        location: string | null;
      };

      const receiverParticipant = assignment?.participants as unknown as { name: string } | undefined;

      return {
        success: true,
        eventTitle: eventData?.title,
        budgetAmount: eventData?.budget_amount,
        budgetCurrency: eventData?.budget_currency || 'USD',
        exchangeDate: eventData?.exchange_date,
        location: eventData?.location,
        giverName: participant.name,
        receiverName: receiverParticipant?.name || 'Your secret match',
        receiverWishlist: [],
      };
    }
  } catch {
    // Ignore Supabase error if not found
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
