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
 * Cryptographically secure array shuffle using Fisher-Yates with Web Crypto / Node crypto
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    let randIndex: number;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      randIndex = buffer[0] % (i + 1);
    } else {
      randIndex = Math.floor(Math.random() * (i + 1));
    }
    const temp = result[i];
    result[i] = result[randIndex];
    result[randIndex] = temp;
  }
  return result;
}

/**
 * Generate Secret Santa assignments ensuring:
 * 1. No participant is assigned to themselves (Derangement: Giver != Receiver).
 * 2. No participant is assigned to a restricted recipient (Exclusion rules).
 * 3. Every participant gives exactly once and receives exactly once (Bijective matching).
 * 4. Uses Most Constrained Variable (MCV) heuristic with Forward Checking to scale up to 10,000 participants.
 */
export function generateSecretSantaPairs(
  participants: ParticipantNode[],
  exclusions: ExclusionRule[] = [],
  maxBacktrackSteps: number = 20000
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

  // Pre-validate receivers: ensure every receiver has at least 1 eligible giver
  for (const receiverId of participantIds) {
    let validGiverCount = 0;
    for (const giverId of participantIds) {
      if (giverId !== receiverId && !exclusionSet.has(`${giverId}:${receiverId}`)) {
        validGiverCount++;
      }
    }
    if (validGiverCount === 0) {
      const p = participants.find((x) => x.id === receiverId);
      throw new UnsatisfiableConstraintsError(
        `Participant "${p?.name || receiverId}" cannot be gifted by anyone due to exclusion rules.`
      );
    }
  }

  // Helper to get valid candidate receivers for a given giver
  function getEligibleCandidates(
    giverId: string,
    assignedReceivers: Set<string>
  ): string[] {
    const list: string[] = [];
    for (const receiverId of participantIds) {
      if (
        receiverId !== giverId &&
        !assignedReceivers.has(receiverId) &&
        !exclusionSet.has(`${giverId}:${receiverId}`)
      ) {
        list.push(receiverId);
      }
    }
    return list;
  }

  // Attempt to solve using MCV backtracking with up to 15 randomized restarts
  for (let attempt = 0; attempt < 15; attempt++) {
    const assignedReceivers = new Set<string>();
    const assignedGivers = new Set<string>();
    const pairings: AssignmentPair[] = [];
    let backtrackCount = 0;

    function solveMCV(): boolean {
      if (pairings.length === n) {
        return true;
      }

      backtrackCount++;
      if (backtrackCount > maxBacktrackSteps) {
        return false;
      }

      // 1. Heuristic: Most Constrained Variable (MCV)
      // Pick unassigned giver with the minimum number of eligible remaining candidates
      let bestGiver: string | null = null;
      let minCandidateList: string[] = [];
      let minCount = Infinity;

      // Randomize unassigned givers check order for varied cycles across runs
      const remainingGivers = shuffleArray(
        participantIds.filter((id) => !assignedGivers.has(id))
      );

      for (const giverId of remainingGivers) {
        const candidates = getEligibleCandidates(giverId, assignedReceivers);
        if (candidates.length === 0) {
          // Dead end detected by forward checking
          return false;
        }
        if (candidates.length < minCount) {
          minCount = candidates.length;
          bestGiver = giverId;
          minCandidateList = candidates;
          // If only 1 candidate, we can't get more constrained than this
          if (minCount === 1) break;
        }
      }

      if (!bestGiver) {
        return true;
      }

      // Shuffle candidate list to ensure fair, non-deterministic pairings
      const randomizedCandidates = shuffleArray(minCandidateList);

      for (const candidate of randomizedCandidates) {
        // Choose
        assignedGivers.add(bestGiver);
        assignedReceivers.add(candidate);
        pairings.push({ giverId: bestGiver, receiverId: candidate });

        // Recurse
        if (solveMCV()) {
          return true;
        }

        // Backtrack
        assignedGivers.delete(bestGiver);
        assignedReceivers.delete(candidate);
        pairings.pop();
      }

      return false;
    }

    if (solveMCV()) {
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
