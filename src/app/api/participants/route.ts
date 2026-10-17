import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createParticipantSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

// GET /api/participants?groupId=xyz - List participants for a group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const participants = await prisma.participant.findMany({
      where: groupId ? { groupId } : undefined,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        groupId: true,
        name: true,
        email: true,
        inviteToken: true,
        hasViewedAssignment: true,
        viewedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: participants.length,
      data: participants,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not fetch participants from database.',
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}

// POST /api/participants - Add a participant to an existing group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createParticipantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid participant data',
          errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const { groupId, name, email } = parsed.data;

    // Check if group exists and is in DRAFT status
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }

    const participant = await prisma.participant.create({
      data: {
        groupId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        inviteToken: crypto.randomUUID(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Participant added successfully',
        data: participant,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to add participant',
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}
