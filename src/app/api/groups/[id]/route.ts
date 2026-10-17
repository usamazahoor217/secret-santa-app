import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            hasViewedAssignment: true,
            viewedAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: { assignments: true, restrictions: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not fetch group.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete group.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
