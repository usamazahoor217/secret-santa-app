import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  createEventAndDrawAction,
  getParticipantAssignmentAction,
  submitWishlistAction,
} from '@/app/actions/event-actions';

describe('Event Creation Integration Test (Action + MySQL Database)', () => {
  let createdEventId: string | undefined;

  afterAll(async () => {
    if (createdEventId) {
      try {
        await prisma.group.delete({
          where: { id: createdEventId },
        });
        console.log(`Cleaned up test group: ${createdEventId}`);
      } catch (err) {
        console.warn('Cleanup error (safe to ignore if db was not used):', err);
      }
    }
    await prisma.$disconnect();
  });

  it('successfully creates an event, generates derangement pairs, saves to MySQL, and retrieves assignments', async () => {
    const testInput = {
      title: 'Holiday Gala Test Event 2026',
      description: 'Automated integration test for event creation and pairing',
      budgetAmount: 75,
      budgetCurrency: 'USD',
      exchangeDate: '2026-12-25',
      location: 'North Pole HQ',
      participants: [
        { name: 'Santa Claus', email: 'santa@northpole.test' },
        { name: 'Rudolph Rednose', email: 'rudolph@northpole.test' },
        { name: 'Buddy Elf', email: 'buddy@northpole.test' },
        { name: 'Frosty Snowman', email: 'frosty@northpole.test' },
      ],
      exclusions: [
        {
          giverEmail: 'santa@northpole.test',
          restrictedReceiverEmail: 'rudolph@northpole.test',
        },
      ],
    };

    // 1. Execute Server Action
    const result = await createEventAndDrawAction(testInput);

    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
    expect(result.participantsCount).toBe(4);
    expect(result.inviteLinks).toHaveLength(4);

    createdEventId = result.eventId;

    // 2. Query MySQL via Prisma to verify persistence
    const dbGroup = await prisma.group.findUnique({
      where: { id: result.eventId },
      include: {
        participants: true,
        assignments: true,
        restrictions: true,
        emailLogs: true,
      },
    });

    expect(dbGroup).not.toBeNull();
    expect(dbGroup?.title).toBe('Holiday Gala Test Event 2026');
    expect(dbGroup?.status).toBe('DRAWN');
    expect(dbGroup?.participants).toHaveLength(4);
    expect(dbGroup?.assignments).toHaveLength(4);
    expect(dbGroup?.restrictions).toHaveLength(1);
    expect(dbGroup?.emailLogs).toHaveLength(4);

    // Verify Derangement rules: No one gives to themselves
    dbGroup?.assignments.forEach((assignment) => {
      expect(assignment.giverId).not.toBe(assignment.receiverId);
    });

    // Verify Exclusion rule: Santa does not give to Rudolph
    const santa = dbGroup?.participants.find((p) => p.email === 'santa@northpole.test');
    const rudolph = dbGroup?.participants.find((p) => p.email === 'rudolph@northpole.test');
    expect(santa).toBeDefined();
    expect(rudolph).toBeDefined();

    const santaAssignment = dbGroup?.assignments.find((a) => a.giverId === santa?.id);
    expect(santaAssignment?.receiverId).not.toBe(rudolph?.id);

    // 3. Test Participant Reveal flow via Invite Token
    const santaLink = result.inviteLinks?.find((l) => l.email === 'santa@northpole.test');
    expect(santaLink).toBeDefined();
    const token = santaLink!.revealUrl.split('/reveal/')[1];

    const revealData = await getParticipantAssignmentAction(token);
    expect(revealData.success).toBe(true);
    expect(revealData.eventTitle).toBe('Holiday Gala Test Event 2026');
    expect(revealData.giverName).toBe('Santa Claus');
    expect(revealData.receiverName).toBeDefined();
    expect(revealData.receiverName).not.toBe('Santa Claus');
    expect(revealData.receiverName).not.toBe('Rudolph Rednose');

    // 4. Test Wishlist submission flow for Rudolph
    const rudolphLink = result.inviteLinks?.find((l) => l.email === 'rudolph@northpole.test');
    const rudolphToken = rudolphLink!.revealUrl.split('/reveal/')[1];

    const wishlistRes = await submitWishlistAction(rudolphToken, [
      'Giant golden carrot',
      'Insulated nose warmer',
    ]);

    expect(wishlistRes.success).toBe(true);

    // Verify Wishlist in MySQL
    const dbWishlist = await prisma.wishlist.findUnique({
      where: { participantId: rudolph!.id },
      include: { items: true },
    });

    expect(dbWishlist).not.toBeNull();
    expect(dbWishlist?.items).toHaveLength(2);
    expect(dbWishlist?.items.map((i) => i.title)).toContain('Giant golden carrot');
    expect(dbWishlist?.items.map((i) => i.title)).toContain('Insulated nose warmer');
  });
});
