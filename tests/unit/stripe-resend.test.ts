import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getResendClient, resetResendClient } from '@/lib/resend';
import { getStripeClient, resetStripeClient, STRIPE_PLANS } from '@/lib/stripe';

describe('Resend & Stripe Client Configurations', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetResendClient();
    resetStripeClient();
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 're_mock_test_key',
      STRIPE_SECRET_KEY: 'sk_test_mock_stripe_key',
    };
  });

  afterEach(() => {
    resetResendClient();
    resetStripeClient();
    process.env = originalEnv;
  });

  describe('Resend Integration', () => {
    it('initializes Resend client when API key is provided', () => {
      const resend = getResendClient();
      expect(resend).toBeDefined();
      expect(typeof resend.emails.send).toBe('function');
    });

    it('throws when RESEND_API_KEY is not configured', () => {
      delete process.env.RESEND_API_KEY;
      resetResendClient();
      expect(() => getResendClient()).toThrow('Missing RESEND_API_KEY');
    });
  });

  describe('Stripe Integration', () => {
    it('initializes Stripe client when secret key is provided', () => {
      const stripe = getStripeClient();
      expect(stripe).toBeDefined();
      expect(typeof stripe.checkout.sessions.create).toBe('function');
    });

    it('throws when STRIPE_SECRET_KEY is not configured', () => {
      delete process.env.STRIPE_SECRET_KEY;
      resetStripeClient();
      expect(() => getStripeClient()).toThrow('Missing STRIPE_SECRET_KEY');
    });

    it('maintains expected free tier and premium holiday pass plan limits', () => {
      expect(STRIPE_PLANS.FREE.maxParticipants).toBe(15);
      expect(STRIPE_PLANS.FREE.priceCents).toBe(0);

      expect(STRIPE_PLANS.PREMIUM_HOLIDAY_PASS.maxParticipants).toBeGreaterThanOrEqual(100);
      expect(STRIPE_PLANS.PREMIUM_HOLIDAY_PASS.priceCents).toBe(999);
      expect(STRIPE_PLANS.PREMIUM_HOLIDAY_PASS.currency).toBe('USD');
    });
  });
});
