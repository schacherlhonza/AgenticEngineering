import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { PlanRequestSchema } from '../schema/request.js';
import { runPlan } from '../orchestrator/runPlan.js';
import { subscribe } from '../orchestrator/eventBus.js';

export const planRouter = Router();

planRouter.post('/plan', (req, res) => {
  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }
  const planId = randomUUID();
  // fire and forget; events flow through the bus
  void runPlan(planId, parsed.data);
  res.status(202).json({ planId });
});

planRouter.get('/plan/:id/events', (req, res) => {
  const planId = req.params.id;

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // initial comment to open the stream
  res.write(': stream open\n\n');

  const heartbeat = setInterval(() => {
    res.write(': hb\n\n');
  }, 15_000);

  const unsubscribe = subscribe(planId, (event) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (event.type === 'final_result' || event.type === 'error') {
      clearInterval(heartbeat);
      unsubscribe();
      res.end();
    }
  });

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});
