import { z } from 'zod';

export const PlanRequestSchema = z.object({
  destination: z.string().min(2).max(80),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  days: z.number().int().min(1).max(14),
  budgetTier: z.enum(['budget', 'mid', 'luxury']),
  interests: z.array(z.string().min(1).max(40)).max(8).default([]),
});
