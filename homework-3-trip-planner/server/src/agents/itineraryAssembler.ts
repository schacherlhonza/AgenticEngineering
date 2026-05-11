import {
  query,
  type SDKAssistantMessage,
  type SDKResultMessage,
} from '@anthropic-ai/claude-agent-sdk';
import { emit } from '../orchestrator/eventBus.js';
import type { Itinerary, PlanRequest, SpecialistOutput } from '../orchestrator/types.js';
import { ITINERARY_JSON_SCHEMA, ItinerarySchema } from '../schema/itinerary.js';

const SYSTEM_PROMPT = `You are a senior trip planner. You receive five specialist briefings and must produce a day-by-day itinerary as STRICT JSON matching the provided schema.

Rules:
- Distribute sights logically by geography (cluster nearby places on the same day).
- Match meal suggestions to nearby attractions where possible.
- Use the BudgetAgent's daily total for "estimatedCostUsd" (you may vary +/- 15% per day to reflect day-specific spend).
- Use the WeatherAgent's per-day numbers verbatim for the "weather" field.
- "morning", "afternoon", "evening" are arrays of short action items (3-6 chars each per item is too short - aim for 6-12 word activities).
- "theme" is a short label like "Old town & rooftops", "Markets & food", "Riverside & museums".
- "packingTips" merges WeatherAgent packing advice with budget-tier-appropriate items.
- Output ONLY the JSON object. Nothing else.`;

export async function runItineraryAssembler(
  planId: string,
  req: PlanRequest,
  specialists: SpecialistOutput[],
): Promise<{ itinerary: Itinerary; costUsd: number }> {
  emit(planId, { type: 'supervisor_started', ts: Date.now() });

  const briefings = specialists
    .map((s) => `### ${s.agent}\n${s.text.trim()}`)
    .join('\n\n');

  const userPrompt = `Trip parameters:
- destination: ${req.destination}
- startDate: ${req.startDate}
- totalDays: ${req.days}
- budgetTier: ${req.budgetTier}
- interests: ${req.interests.length > 0 ? req.interests.join(', ') : '(none)'}

Specialist briefings:

${briefings}

Now produce the full itinerary JSON.`;

  let structured: unknown;
  let costUsd = 0;

  for await (const message of query({
    prompt: userPrompt,
    options: {
      model: 'sonnet',
      systemPrompt: SYSTEM_PROMPT,
      outputFormat: {
        type: 'json_schema',
        schema: ITINERARY_JSON_SCHEMA,
      },
    },
  })) {
    if (message.type === 'assistant') {
      const assistantMsg = message as SDKAssistantMessage;
      for (const block of assistantMsg.message.content) {
        if (block.type === 'text') {
          // accumulate but the structured_output on the result is authoritative
          structured ??= safeJsonParse(block.text);
        }
      }
    } else if (message.type === 'result') {
      const resultMsg = message as SDKResultMessage;
      if (resultMsg.subtype === 'success' && resultMsg.structured_output) {
        structured = resultMsg.structured_output;
      }
      if (typeof resultMsg.total_cost_usd === 'number') {
        costUsd = resultMsg.total_cost_usd;
      }
    }
  }

  if (!structured) {
    throw new Error('ItineraryAssembler: no structured output');
  }

  const itinerary = ItinerarySchema.parse(structured);
  return { itinerary, costUsd };
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
