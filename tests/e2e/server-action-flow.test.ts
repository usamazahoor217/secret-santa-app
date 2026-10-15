import { describe, it, expect } from 'vitest';
import {
  createEventAndDrawAction,
  getParticipantAssignmentAction,
  submitWishlistAction,
} from '@/app/actions/event-actions';

describe('End-to-End User Flow: Event Creation, Matching & Magic Reveal', () => {
  it('completes the entire flow: create group -> add participants -> draw -> send emails -> reveal assignment -> submit wishlist', async () => {
    // 1. User configures the event
    const eventInput = {
      title: 'North Pole Engineering Exchange',
      budgetAmount: 40,
      budgetCurrency: 'USD',
      exchangeDate: '2026-12-25',
      location: 'Virtual Zoom Room',
      participants: [
        { name: 'Santa Claus', email: 'santa@northpole.org' },
        { name: 'Rudolph Rednose', email: 'rudolph@northpole.org' },
        { name: 'Buddy Elf', email: 'buddy@northpole.org' },
        { name: 'Frosty Snowman', email: 'frosty@northpole.org' },
      ],
      exclusions: [
        // Santa cannot give to Rudolph
        {
          giverEmail: 'santa@northpole.org',
          restrictedReceiverEmail: 'rudolph@northpole.org',
        },
      ],
    };

    // 2. User hits the "Draw & Send Emails" button
    const result = await createEventAndDrawAction(eventInput);

    // Verify successful creation
    expect(result.success).toBe(true);
    expect(result.participantsCount).toBe(4);
    expect(result.emailsSent).toBe(4);
    expect(result.inviteLinks).toHaveLength(4);

    // Verify all invite links have unique tokens
    const tokens = result.inviteLinks!.map((link) => {
      const parts = link.revealUrl.split('/reveal/');
      return parts[1];
    });
    expect(new Set(tokens).size).toBe(4);

    // 3. Participant opens their magic reveal link
    const firstParticipant = result.inviteLinks![0];
    const firstToken = firstParticipant.revealUrl.split('/reveal/')[1];

    const revealResult = await getParticipantAssignmentAction(firstToken);

    expect(revealResult.success).toBe(true);
    expect(revealResult.eventTitle).toBe('North Pole Engineering Exchange');
    expect(revealResult.budgetAmount).toBe(40);
    expect(revealResult.giverName).toBe(firstParticipant.name);
    // Secret recipient is assigned and not self
    expect(revealResult.receiverName).toBeDefined();
    expect(revealResult.receiverName).not.toBe(firstParticipant.name);

    // Check exclusion constraint: If giver is Santa, receiver CANNOT be Rudolph
    if (firstParticipant.name === 'Santa Claus') {
      expect(revealResult.receiverName).not.toBe('Rudolph Rednose');
    }

    // 4. Participant adds wishlist items
    const wishlistResult = await submitWishlistAction(firstToken, [
      'Warm wool socks',
      'Hot cocoa mix',
      'Candy cane box',
    ]);
    expect(wishlistResult.success).toBe(true);
  });

  it('rejects invalid submission with fewer than 2 participants', async () => {
    const invalidInput = {
      title: 'Solo Santa',
      participants: [{ name: 'Solo', email: 'solo@example.com' }],
      exclusions: [],
    };

    const result = await createEventAndDrawAction(
      invalidInput as unknown as Parameters<typeof createEventAndDrawAction>[0]
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('Validation failed');
  });
});
