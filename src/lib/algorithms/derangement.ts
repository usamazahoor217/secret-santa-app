export interface ParticipantNode {
  id: string;
  name: string;
  email?: string;
}

export interface ExclusionRule {
  giverId: string;
  restrictedReceiverId: string;
}

export interface AssignmentPair {
  giverId: string;
  receiverId: string;
}

export class UnsatisfiableConstraintsError extends Error {
  constructor(message: string = 'Unable to generate valid Secret Santa pairings with the given exclusion constraints.') {
    super(message);
    this.name = 'UnsatisfiableConstraintsError';
  }
}

/**
 * Modern Fisher-Yates shuffle with random or cryptographically secure randomness
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate Secret Santa assignments ensuring:
 * 1. No participant is assigned to themselves (Derangement).
 * 2. No participant is assigned to a restricted recipient (Exclusion rules).
 * 3. Every participant gives exactly once and receives exactly once (Bijective matching).
 */
export function generateSecretSantaPairs(
  participants: ParticipantNode[],
  exclusions: ExclusionRule[] = [],
  maxBacktrackSteps: number = 10000
): AssignmentPair[] {
  const n = participants.length;

  if (n < 2) {
    throw new UnsatisfiableConstraintsError(
      'A Secret Santa exchange requires at least 2 participants.'
    );
  }

  const participantIds = participants.map((p) => p.id);

  // Build exclusion lookup set for O(1) checks: "giverId:receiverId"
  const exclusionSet = new Set<string>();
  for (const rule of exclusions) {
    exclusionSet.add(`${rule.giverId}:${rule.restrictedReceiverId}`);
  }

  // Pre-validate: ensure no participant excludes all other participants
  for (const giverId of participantIds) {
    let validReceiverCount = 0;
    for (const receiverId of participantIds) {
      if (giverId !== receiverId && !exclusionSet.has(`${giverId}:${receiverId}`)) {
        validReceiverCount++;
      }
    }
    if (validReceiverCount === 0) {
      const p = participants.find((x) => x.id === giverId);
      throw new UnsatisfiableConstraintsError(
        `Participant "${p?.name || giverId}" has no eligible recipients due to exclusion rules.`
      );
    }
  }

  // Backtracking solver
  // Sort or shuffle participants to ensure fair, non-deterministic pairings on each run
  const shuffledGivers = shuffleArray(participantIds);

  const assignedReceivers = new Set<string>();
  const pairings: AssignmentPair[] = [];
  let backtrackCount = 0;

  function solve(giverIndex: number): boolean {
    if (giverIndex === shuffledGivers.length) {
      return true; // Successfully paired all participants
    }

    backtrackCount++;
    if (backtrackCount > maxBacktrackSteps) {
      return false; // Exceeded budget
    }

    const currentGiver = shuffledGivers[giverIndex];

    // Find all valid candidates for this giver:
    // 1. Candidate is not self (giverId !== receiverId)
    // 2. Candidate has not already been assigned to another giver
    // 3. Not in exclusion set
    const candidates = participantIds.filter((receiverId) => {
      if (receiverId === currentGiver) return false;
      if (assignedReceivers.has(receiverId)) return false;
      if (exclusionSet.has(`${currentGiver}:${receiverId}`)) return false;
      return true;
    });

    // Randomize candidates so every solution search explores a fresh permutation
    const shuffledCandidates = shuffleArray(candidates);

    for (const candidate of shuffledCandidates) {
      // Choose
      assignedReceivers.add(candidate);
      pairings.push({ giverId: currentGiver, receiverId: candidate });

      // Recurse
      if (solve(giverIndex + 1)) {
        return true;
      }

      // Backtrack
      assignedReceivers.delete(candidate);
      pairings.pop();
    }

    return false;
  }

  // Attempt to solve, allowing up to 10 full restart attempts with different shuffles
  for (let attempt = 0; attempt < 10; attempt++) {
    backtrackCount = 0;
    assignedReceivers.clear();
    pairings.length = 0;

    if (solve(0)) {
      // Extra sanity checks before returning
      validatePairings(participants, pairings, exclusions);
      return pairings;
    }
  }

  throw new UnsatisfiableConstraintsError(
    'Failed to find a valid Secret Santa configuration satisfying all exclusion rules.'
  );
}

/**
 * Validate that an assignment strictly satisfies all Secret Santa rules
 */
export function validatePairings(
  participants: ParticipantNode[],
  pairings: AssignmentPair[],
  exclusions: ExclusionRule[] = []
): void {
  if (pairings.length !== participants.length) {
    throw new Error(
      `Pairing count (${pairings.length}) does not match participant count (${participants.length}).`
    );
  }

  const participantIds = new Set(participants.map((p) => p.id));
  const givers = new Set<string>();
  const receivers = new Set<string>();
  const exclusionSet = new Set(
    exclusions.map((e) => `${e.giverId}:${e.restrictedReceiverId}`)
  );

  for (const pair of pairings) {
    // 1. Participant exists
    if (!participantIds.has(pair.giverId) || !participantIds.has(pair.receiverId)) {
      throw new Error(`Pairing contains unknown participant ID: ${pair.giverId} -> ${pair.receiverId}`);
    }

    // 2. No self-assignment
    if (pair.giverId === pair.receiverId) {
      throw new Error(
        `Self-assignment detected! Participant ${pair.giverId} is assigned to themselves.`
      );
    }

    // 3. No exclusion rule violation
    if (exclusionSet.has(`${pair.giverId}:${pair.receiverId}`)) {
      throw new Error(
        `Exclusion rule violated: ${pair.giverId} cannot be assigned to ${pair.receiverId}.`
      );
    }

    givers.add(pair.giverId);
    receivers.add(pair.receiverId);
  }

  // 4. Bijective: every participant gives exactly once and receives exactly once
  if (givers.size !== participants.length) {
    throw new Error('Not all participants are assigned as givers.');
  }
  if (receivers.size !== participants.length) {
    throw new Error('Not all participants are assigned as receivers.');
  }
}
