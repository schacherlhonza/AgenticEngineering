import {
  query,
  type SDKAssistantMessage,
  type SDKResultMessage,
  type Options,
} from '@anthropic-ai/claude-agent-sdk';
import { emit } from '../orchestrator/eventBus.js';
import type { AgentName, SpecialistOutput } from '../orchestrator/types.js';

export type SpecialistConfig = {
  agent: AgentName;
  systemPrompt: string;
  userPrompt: string;
  extraOptions?: Partial<Options>;
};

export async function runSpecialist(
  planId: string,
  cfg: SpecialistConfig,
): Promise<SpecialistOutput> {
  emit(planId, { type: 'agent_started', agent: cfg.agent, ts: Date.now() });

  const chunks: string[] = [];
  let costUsd = 0;

  for await (const message of query({
    prompt: cfg.userPrompt,
    options: {
      model: 'sonnet',
      systemPrompt: cfg.systemPrompt,
      ...cfg.extraOptions,
    },
  })) {
    if (message.type === 'assistant') {
      const assistantMsg = message as SDKAssistantMessage;
      for (const block of assistantMsg.message.content) {
        if (block.type === 'text') {
          chunks.push(block.text);
        } else if (block.type === 'tool_use') {
          emit(planId, {
            type: 'tool_call',
            agent: cfg.agent,
            tool: block.name,
            ts: Date.now(),
          });
        }
      }
    } else if (message.type === 'result') {
      const resultMsg = message as SDKResultMessage;
      if (typeof resultMsg.total_cost_usd === 'number') {
        costUsd = resultMsg.total_cost_usd;
      }
    }
  }

  const text = chunks.join('');
  emit(planId, {
    type: 'agent_finished',
    agent: cfg.agent,
    preview: text.slice(0, 240),
    ts: Date.now(),
  });

  return { agent: cfg.agent, text, costUsd };
}
