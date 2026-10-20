import { NextResponse, type NextRequest } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { success: false, message: 'Missing stripe-signature header or webhook secret.' },
        { status: 400 }
      );
    }

    const payload = await request.text();
    const stripe = getStripeClient();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('[StripeWebhook] Signature verification failed:', err);
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature.' },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const eventId = session.metadata?.eventId;

      if (eventId) {
        // Upgrade event to premium
        await prisma.group.update({
          where: { id: eventId },
          data: { isPremium: true },
        });

        console.log(`[StripeWebhook] Group ${eventId} upgraded to Premium.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[StripeWebhook] Error processing webhook:', err);
    return NextResponse.json(
      { success: false, message: 'Internal webhook error.' },
      { status: 500 }
    );
  }
}
