import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as stripeWebhookHandler } from '@/app/api/webhooks/stripe/route';
import { POST as resendWebhookHandler } from '@/app/api/webhooks/resend/route';
import { prisma } from '@/lib/prisma';
import * as stripeLib from '@/lib/stripe';

describe('Webhook Handlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Stripe Webhook', () => {
    it('returns 400 if signature or secret is missing', async () => {
      const req = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {},
        body: JSON.stringify({}),
      });

      const res = await stripeWebhookHandler(req as any);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain('Missing stripe-signature');
    });

    it('processes checkout.session.completed and upgrades group to premium', async () => {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
      const mockConstructEvent = vi.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session',
            metadata: {
              eventId: 'event-uuid-premium',
            },
          },
        },
      });

      vi.spyOn(stripeLib, 'getStripeClient').mockReturnValue({
        webhooks: {
          constructEvent: mockConstructEvent,
        },
      } as any);

      const updateSpy = vi.spyOn(prisma.group, 'update').mockResolvedValue({} as any);

      const req = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_sig_123',
        },
        body: 'raw_payload_text',
      });

      const res = await stripeWebhookHandler(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.received).toBe(true);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'event-uuid-premium' },
        data: { isPremium: true },
      });
    });
  });

  describe('Resend Webhook', () => {
    it('returns 400 on invalid payload structure', async () => {
      const req = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await resendWebhookHandler(req as any);
      expect(res.status).toBe(400);
    });

    it('updates email log status to DELIVERED when email.delivered received', async () => {
      vi.spyOn(prisma.emailLog, 'findFirst').mockResolvedValue({
        id: 'log-123',
        resendEmailId: 're_email_abc',
      } as any);

      const updateSpy = vi.spyOn(prisma.emailLog, 'update').mockResolvedValue({} as any);

      const req = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        body: JSON.stringify({
          type: 'email.delivered',
          created_at: new Date().toISOString(),
          data: {
            email_id: 're_email_abc',
          },
        }),
      });

      const res = await resendWebhookHandler(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.received).toBe(true);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'log-123' },
        data: { status: 'DELIVERED' },
      });
    });
  });
});
