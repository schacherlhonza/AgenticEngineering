import { z } from 'zod';

export const ItineraryDaySchema = z.object({
  day: z.number().int(),
  date: z.string(),
  theme: z.string(),
  weather: z.object({
    summary: z.string(),
    highC: z.number(),
    lowC: z.number(),
  }),
  morning: z.array(z.string()),
  afternoon: z.array(z.string()),
  evening: z.array(z.string()),
  meals: z.object({
    breakfast: z.string(),
    lunch: z.string(),
    dinner: z.string(),
  }),
  transport: z.string(),
  estimatedCostUsd: z.number(),
});

export const ItinerarySchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  totalDays: z.number().int(),
  budgetTier: z.enum(['budget', 'mid', 'luxury']),
  summary: z.string(),
  packingTips: z.array(z.string()),
  totalEstimatedCostUsd: z.number(),
  days: z.array(ItineraryDaySchema),
});

/**
 * JSON Schema mirror of ItinerarySchema for the SDK's outputFormat: 'json_schema'.
 * Hand-written to keep it dependency-free (no zod-to-json-schema).
 */
export const ITINERARY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    destination: { type: 'string' },
    startDate: { type: 'string' },
    totalDays: { type: 'integer' },
    budgetTier: { type: 'string', enum: ['budget', 'mid', 'luxury'] },
    summary: { type: 'string' },
    packingTips: { type: 'array', items: { type: 'string' } },
    totalEstimatedCostUsd: { type: 'number' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'integer' },
          date: { type: 'string' },
          theme: { type: 'string' },
          weather: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              highC: { type: 'number' },
              lowC: { type: 'number' },
            },
            required: ['summary', 'highC', 'lowC'],
            additionalProperties: false,
          },
          morning: { type: 'array', items: { type: 'string' } },
          afternoon: { type: 'array', items: { type: 'string' } },
          evening: { type: 'array', items: { type: 'string' } },
          meals: {
            type: 'object',
            properties: {
              breakfast: { type: 'string' },
              lunch: { type: 'string' },
              dinner: { type: 'string' },
            },
            required: ['breakfast', 'lunch', 'dinner'],
            additionalProperties: false,
          },
          transport: { type: 'string' },
          estimatedCostUsd: { type: 'number' },
        },
        required: [
          'day',
          'date',
          'theme',
          'weather',
          'morning',
          'afternoon',
          'evening',
          'meals',
          'transport',
          'estimatedCostUsd',
        ],
        additionalProperties: false,
      },
    },
  },
  required: [
    'destination',
    'startDate',
    'totalDays',
    'budgetTier',
    'summary',
    'packingTips',
    'totalEstimatedCostUsd',
    'days',
  ],
  additionalProperties: false,
} as const;
