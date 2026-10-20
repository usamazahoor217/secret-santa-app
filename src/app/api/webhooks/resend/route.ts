import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    status?: string;
    bounce_type?: string;
    reason?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResendWebhookPayload;

    if (!body || !body.type || !body.data?.email_id) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload structure.' },
        { status: 400 }
      );
    }

    const { type, data } = body;
    const emailId = data.email_id;

    // Check if we have an audit log with this Resend email ID
    const existingLog = await prisma.emailLog.findFirst({
      where: { resendEmailId: emailId },
    });

    if (existingLog) {
      if (type === 'email.delivered') {
        await prisma.emailLog.update({
          where: { id: existingLog.id },
          data: { status: 'DELIVERED' },
        });
      } else if (type === 'email.bounced' || type === 'email.failed') {
        await prisma.emailLog.update({
          where: { id: existingLog.id },
          data: {
            status: 'FAILED',
            errorMessage: data.reason || data.bounce_type || 'Email delivery failed/bounced',
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[ResendWebhook] Error handling webhook:', err);
    return NextResponse.json(
      { success: false, message: 'Internal webhook error.' },
      { status: 500 }
    );
  }
}
