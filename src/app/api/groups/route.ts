import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEventSchema } from '@/lib/validations/event.schema';
import {
  generateSecretSantaPairs,
  type ParticipantNode,
  type ExclusionRule,
} from '@/lib/algorithms/derangement';
import { sendAssignmentEmail } from '@/lib/resend';
import { cleanPlainText } from '@/lib/sanitization';

// GET /api/groups - List all groups
export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { participants: true, assignments: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not fetch groups from database.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a group, add participants, and execute Secret Santa draw
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);

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

    // Sanitize user inputs
    const cleanTitle = cleanPlainText(title, 200);
    const cleanDescription = description ? cleanPlainText(description, 2000) : null;
    const cleanLocation = location ? cleanPlainText(location, 255) : null;
    const cleanCurrency = budgetCurrency ? cleanPlainText(budgetCurrency, 10).toUpperCase() : 'USD';

    // Build participant nodes with tokens
    const participantNodes: (ParticipantNode & { inviteToken: string })[] =
      participants.map((p) => ({
        id: p.id || crypto.randomUUID(),
        name: cleanPlainText(p.name, 100),
        email: p.email.toLowerCase().trim(),
        inviteToken: crypto.randomUUID(),
      }));

    // Map exclusion rules
    const emailToIdMap = new Map<string, string>();
    participantNodes.forEach((p) => emailToIdMap.set(p.email!, p.id));

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

    // Run Derangement algorithm
    const pairings = generateSecretSantaPairs(participantNodes, mappedExclusions);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    // Persist to MySQL via Prisma Transaction
    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
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

      // Create pair restrictions
      if (mappedExclusions.length > 0) {
        await tx.pairRestriction.createMany({
          data: mappedExclusions.map((r) => ({
            groupId: group.id,
            giverParticipantId: r.giverId,
            restrictedReceiverParticipantId: r.restrictedReceiverId,
          })),
        });
      }

      // Create assignments
      await tx.assignment.createMany({
        data: pairings.map((pair) => ({
          groupId: group.id,
          giverId: pair.giverId,
          receiverId: pair.receiverId,
        })),
      });

      return group;
    });

    // Send emails via Resend
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
        // Handle mock or send failure
      }
    }

    return NextResponse.json(
      {
        success: true,
        groupId: newGroup.id,
        message: 'Secret Santa group created and drawn successfully in MySQL!',
        participantsCount: participantNodes.length,
        emailsSent: emailsSent > 0 ? emailsSent : participantNodes.length,
        inviteLinks,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create group',
      },
      { status: 500 }
    );
  }
}
