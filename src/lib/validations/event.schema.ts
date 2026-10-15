import { z } from 'zod';

export const participantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
});

export const exclusionRuleSchema = z.object({
  giverEmail: z.string().email(),
  restrictedReceiverEmail: z.string().email(),
});

export const createEventSchema = z.object({
  title: z.string().min(2, 'Event title must be at least 2 characters').max(120),
  description: z.string().max(1000).optional().nullable(),
  budgetAmount: z.number().positive('Budget must be positive').optional().nullable(),
  budgetCurrency: z.string().length(3).default('USD').optional(),
  exchangeDate: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  allowWishlists: z.boolean().default(true).optional(),
  participants: z
    .array(participantSchema)
    .min(2, 'You must add at least 2 participants for a Secret Santa exchange'),
  exclusions: z.array(exclusionRuleSchema).default([]).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ParticipantInput = z.infer<typeof participantSchema>;
export type ExclusionRuleInput = z.infer<typeof exclusionRuleSchema>;
