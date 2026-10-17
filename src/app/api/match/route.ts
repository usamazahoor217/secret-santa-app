import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateSecretSantaPairs,
  type ParticipantNode,
  type ExclusionRule,
} from '@/lib/algorithms/derangement';
import { z } from 'zod';

const matchRequestSchema = z.object({
  title: z.string().optional().default('Live Matching Engine Test'),
  groupId: z.string().optional(),
  participants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Name is required'),
        email: z.string().optional(),
      })
    )
    .min(2, 'At least 2 participants are required for Secret Santa matching'),
  exclusions: z
    .array(
      z.object({
        giverId: z.string(),
        restrictedReceiverId: z.string(),
      })
    )
    .optional()
    .default([]),
});

// GET /api/match?groupId=xyz - Fetch saved match results from MySQL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { success: false, message: 'Missing groupId parameter' },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
        assignments: {
          include: {
            giver: true,
            receiver: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found in MySQL' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        groupId: group.id,
        title: group.title,
        status: group.status,
        drawnAt: group.drawnAt,
        participantsCount: group.participants.length,
        assignments: group.assignments.map((a) => ({
          id: a.id,
          giverId: a.giverId,
          giverName: a.giver.name,
          giverEmail: a.giver.email,
          receiverId: a.receiverId,
          receiverName: a.receiver.name,
          receiverEmail: a.receiver.email,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve match results from database',
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}

// POST /api/match - Run matching algorithm & save groups, participants & assignments in MySQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = matchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const { title, participants, exclusions } = parsed.data;

    // Prepare participants with fresh unique database UUIDs & valid emails
    const clientIdToDbIdMap = new Map<string, string>();
    const timestamp = Date.now();
    const preparedParticipants: (ParticipantNode & { inviteToken: string })[] = participants.map(
      (p, index) => {
        const dbId = crypto.randomUUID();
        const clientKey = p.id || String(index);
        clientIdToDbIdMap.set(clientKey, dbId);
        clientIdToDbIdMap.set(p.name.trim().toLowerCase(), dbId);

        const sanitizedName = p.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const email =
          p.email && p.email.trim().length > 0 && p.email.includes('@')
            ? p.email.trim().toLowerCase()
            : `${sanitizedName || 'santa'}_${timestamp}_${index}_${crypto.randomUUID().slice(0, 5)}@secretsanta.local`;

        return {
          id: dbId,
          name: p.name.trim(),
          email,
          inviteToken: crypto.randomUUID(),
        };
      }
    );

    // Map exclusion rules to the new DB IDs
    const idSet = new Set(preparedParticipants.map((p) => p.id));
    const validExclusions: ExclusionRule[] = [];
    for (const e of exclusions) {
      const giverId = clientIdToDbIdMap.get(e.giverId) || e.giverId;
      const restrictedReceiverId =
        clientIdToDbIdMap.get(e.restrictedReceiverId) || e.restrictedReceiverId;
      if (idSet.has(giverId) && idSet.has(restrictedReceiverId) && giverId !== restrictedReceiverId) {
        validExclusions.push({ giverId, restrictedReceiverId });
      }
    }

    // Execute Derangement Algorithm (Guaranteed no self-matches and constraint satisfaction)
    const pairings = generateSecretSantaPairs(preparedParticipants, validExclusions);

    // Save transactionally to MySQL using Prisma ORM
    const savedGroup = await prisma.$transaction(async (tx) => {
      // 1. Create Group
      const group = await tx.group.create({
        data: {
          title,
          description: 'Created via Real-Time Interactive Matching Engine',
          status: 'DRAWN',
          drawnAt: new Date(),
          budgetAmount: 25.0,
          budgetCurrency: 'USD',
        },
      });

      // 2. Create Participants
      await tx.participant.createMany({
        data: preparedParticipants.map((p) => ({
          id: p.id,
          groupId: group.id,
          name: p.name,
          email: p.email!,
          inviteToken: p.inviteToken,
        })),
      });

      // 3. Create Pair Restrictions
      if (validExclusions.length > 0) {
        await tx.pairRestriction.createMany({
          data: validExclusions.map((rule) => ({
            groupId: group.id,
            giverParticipantId: rule.giverId,
            restrictedReceiverParticipantId: rule.restrictedReceiverId,
          })),
        });
      }

      // 4. Create Assignments
      await tx.assignment.createMany({
        data: pairings.map((pair) => ({
          groupId: group.id,
          giverId: pair.giverId,
          receiverId: pair.receiverId,
        })),
      });

      return group;
    });

    // Format response matching frontend expectations
    const participantMap = new Map(preparedParticipants.map((p) => [p.id, p]));

    const enrichedAssignments = pairings.map((pair) => {
      const giver = participantMap.get(pair.giverId);
      const receiver = participantMap.get(pair.receiverId);
      return {
        giverId: pair.giverId,
        giverName: giver?.name || pair.giverId,
        giverEmail: giver?.email,
        receiverId: pair.receiverId,
        receiverName: receiver?.name || pair.receiverId,
        receiverEmail: receiver?.email,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Matches computed and successfully committed to MySQL database!',
        database: 'secretsanta',
        groupId: savedGroup.id,
        savedAt: savedGroup.drawnAt,
        participantsCount: preparedParticipants.length,
        assignments: enrichedAssignments,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Matching failed',
      },
      { status: 500 }
    );
  }
}
