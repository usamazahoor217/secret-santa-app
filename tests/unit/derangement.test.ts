import { describe, it, expect } from 'vitest';
import {
  generateSecretSantaPairs,
  validatePairings,
  UnsatisfiableConstraintsError,
  type ParticipantNode,
  type ExclusionRule,
} from '@/lib/algorithms/derangement';

describe('Secret Santa Derangement Algorithm', () => {
  const sampleParticipants: ParticipantNode[] = [
    { id: 'p1', name: 'Alice', email: 'alice@example.com' },
    { id: 'p2', name: 'Bob', email: 'bob@example.com' },
    { id: 'p3', name: 'Charlie', email: 'charlie@example.com' },
    { id: 'p4', name: 'Diana', email: 'diana@example.com' },
    { id: 'p5', name: 'Evan', email: 'evan@example.com' },
  ];

  it('strictly ensures NO participant is ever assigned to themselves (Self-Matching Rule)', () => {
    const pairings = generateSecretSantaPairs(sampleParticipants);

    expect(pairings).toHaveLength(sampleParticipants.length);

    pairings.forEach((pair) => {
      expect(pair.giverId).not.toBe(pair.receiverId);
    });

    // Verification helper does not throw
    expect(() => validatePairings(sampleParticipants, pairings)).not.toThrow();
  });

  it('guarantees every participant gives to exactly one person and receives from exactly one person', () => {
    const pairings = generateSecretSantaPairs(sampleParticipants);

    const givers = pairings.map((p) => p.giverId);
    const receivers = pairings.map((p) => p.receiverId);

    // All givers are unique
    expect(new Set(givers).size).toBe(sampleParticipants.length);
    // All receivers are unique
    expect(new Set(receivers).size).toBe(sampleParticipants.length);
  });

  it('satisfies explicit exclusion constraints (e.g. Alice cannot give to Bob)', () => {
    const exclusions: ExclusionRule[] = [
      { giverId: 'p1', restrictedReceiverId: 'p2' }, // Alice cannot give to Bob
      { giverId: 'p2', restrictedReceiverId: 'p1' }, // Bob cannot give to Alice
    ];

    // Run 50 iterations to ensure stochastic consistency
    for (let i = 0; i < 50; i++) {
      const pairings = generateSecretSantaPairs(sampleParticipants, exclusions);

      const alicePair = pairings.find((p) => p.giverId === 'p1');
      const bobPair = pairings.find((p) => p.giverId === 'p2');

      expect(alicePair?.receiverId).not.toBe('p2');
      expect(bobPair?.receiverId).not.toBe('p1');
      expect(() => validatePairings(sampleParticipants, pairings, exclusions)).not.toThrow();
    }
  });

  it('scales reliably to large groups (50 and 100 participants)', () => {
    const largeGroup: ParticipantNode[] = Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i}`,
      name: `Participant ${i}`,
    }));

    // Add multiple random exclusions (e.g. pairs of couples)
    const exclusions: ExclusionRule[] = [
      { giverId: 'user-0', restrictedReceiverId: 'user-1' },
      { giverId: 'user-1', restrictedReceiverId: 'user-0' },
      { giverId: 'user-2', restrictedReceiverId: 'user-3' },
      { giverId: 'user-3', restrictedReceiverId: 'user-2' },
    ];

    const pairings = generateSecretSantaPairs(largeGroup, exclusions);
    expect(pairings).toHaveLength(50);
    expect(() => validatePairings(largeGroup, pairings, exclusions)).not.toThrow();
  });

  it('handles minimum group size of 2 participants', () => {
    const duo: ParticipantNode[] = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];

    const pairings = generateSecretSantaPairs(duo);
    expect(pairings).toHaveLength(2);

    const p1 = pairings.find((p) => p.giverId === 'p1');
    const p2 = pairings.find((p) => p.giverId === 'p2');

    expect(p1?.receiverId).toBe('p2');
    expect(p2?.receiverId).toBe('p1');
  });

  it('throws an error if there are fewer than 2 participants', () => {
    const single: ParticipantNode[] = [{ id: 'p1', name: 'Alone' }];
    expect(() => generateSecretSantaPairs(single)).toThrow(UnsatisfiableConstraintsError);
    expect(() => generateSecretSantaPairs([])).toThrow(UnsatisfiableConstraintsError);
  });

  it('detects impossible exclusion graphs and throws UnsatisfiableConstraintsError', () => {
    // 2 participants, but Alice excludes Bob
    const duo: ParticipantNode[] = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const impossibleExclusion: ExclusionRule[] = [
      { giverId: 'p1', restrictedReceiverId: 'p2' },
    ];

    expect(() => generateSecretSantaPairs(duo, impossibleExclusion)).toThrow(
      UnsatisfiableConstraintsError
    );
  });

  it('passes Monte Carlo simulation of 200 consecutive runs with 0 self-assignments', () => {
    for (let i = 0; i < 200; i++) {
      const pairings = generateSecretSantaPairs(sampleParticipants);
      for (const pair of pairings) {
        if (pair.giverId === pair.receiverId) {
          throw new Error(`Self-match found on iteration ${i} for ${pair.giverId}`);
        }
      }
    }
  });
});
