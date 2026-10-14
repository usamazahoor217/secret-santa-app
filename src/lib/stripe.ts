import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function resetStripeClient(): void {
  stripeInstance = null;
}

export function getStripeClient(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
    typescript: true,
  });

  return stripeInstance;
}

export const STRIPE_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Elf Tier',
    maxParticipants: 15,
    maxRestrictions: 5,
    priceCents: 0,
  },
  PREMIUM_HOLIDAY_PASS: {
    id: 'premium_holiday_pass',
    name: 'Santa Pro Pass',
    maxParticipants: 1000,
    maxRestrictions: 500,
    priceCents: 999, // $9.99 one-time per event
    currency: 'USD',
  },
} as const;

export interface CreateCheckoutSessionParams {
  eventId: string;
  organizerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const stripe = getStripeClient();

  return await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: STRIPE_PLANS.PREMIUM_HOLIDAY_PASS.currency.toLowerCase(),
          product_data: {
            name: `${STRIPE_PLANS.PREMIUM_HOLIDAY_PASS.name} - Unlimited Participants & Festive Features`,
            description: 'Unlock unlimited participants, custom email themes, and advanced exclusion rules.',
          },
          unit_amount: STRIPE_PLANS.PREMIUM_HOLIDAY_PASS.priceCents,
        },
        quantity: 1,
      },
    ],
    customer_email: params.organizerEmail,
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      eventId: params.eventId,
    },
  });
}
