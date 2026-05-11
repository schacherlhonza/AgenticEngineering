import { EventEmitter } from 'node:events';
import type { PlanEvent } from './types.js';

const buses = new Map<string, EventEmitter>();

export function getOrCreateBus(planId: string): EventEmitter {
  let bus = buses.get(planId);
  if (!bus) {
    bus = new EventEmitter();
    bus.setMaxListeners(20);
    buses.set(planId, bus);
  }
  return bus;
}

export function emit(planId: string, event: PlanEvent): void {
  getOrCreateBus(planId).emit('event', event);
}

export function subscribe(planId: string, listener: (event: PlanEvent) => void): () => void {
  const bus = getOrCreateBus(planId);
  bus.on('event', listener);
  return () => bus.off('event', listener);
}

export function closeBus(planId: string): void {
  const bus = buses.get(planId);
  if (bus) {
    bus.removeAllListeners();
    buses.delete(planId);
  }
}
