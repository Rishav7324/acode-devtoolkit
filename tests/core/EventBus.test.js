import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus.js';

describe('EventBus', () => {
  it('should subscribe and emit an event', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test:event', handler);
    bus.emit('test:event', { data: 1 });
    expect(handler).toHaveBeenCalledWith({ data: 1 });
  });

  it('should support wildcard listeners with *', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('*', handler);
    bus.emit('test:event', { data: 1 });
    expect(handler).toHaveBeenCalledWith({ event: 'test:event', data: { data: 1 } });
  });

  it('should support once listeners', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.once('test:event', handler);
    bus.emit('test:event', 'first');
    bus.emit('test:event', 'second');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('first');
  });

  it('should unregister a listener via off()', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test:event', handler);
    bus.off('test:event', handler);
    bus.emit('test:event', { data: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should unregister a one-time listener via the returned unsubscribe', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsub = bus.once('test:event', handler);
    unsub();
    bus.emit('test:event', { data: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle unregistering a listener that was never subscribed', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    expect(() => bus.off('test:event', handler)).not.toThrow();
  });

  it('should not call handlers for other event names', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('other:event', handler);
    bus.emit('test:event', { data: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should not throw when emitting with no listeners', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nonexistent:event')).not.toThrow();
  });

  it('should clear all listeners when clear() is called', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test:event', handler);
    bus.on('other:event', handler);
    bus.clear();
    bus.emit('test:event', { data: 1 });
    bus.emit('other:event', { data: 2 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return unsubscribe function from on()', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsubscribe = bus.on('test:event', handler);
    unsubscribe();
    bus.emit('test:event', { data: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should support listener priority ordering', () => {
    const bus = new EventBus();
    const order = [];
    bus.on('test:event', () => order.push('low'), null, -10);
    bus.on('test:event', () => order.push('high'), null, 10);
    bus.on('test:event', () => order.push('normal'), null, 0);
    bus.emit('test:event');
    expect(order).toEqual(['high', 'normal', 'low']);
  });

  it('should report listener count', () => {
    const bus = new EventBus();
    bus.on('test:event', vi.fn());
    bus.on('test:event', vi.fn());
    expect(bus.listenerCount('test:event')).toBe(2);
    expect(bus.listenerCount('other')).toBe(0);
  });

  it('should list registered events', () => {
    const bus = new EventBus();
    bus.on('a', vi.fn());
    bus.on('b', vi.fn());
    const events = bus.getEvents();
    expect(events).toContain('a');
    expect(events).toContain('b');
  });

  it('should resolve async emit via emitAsync', async () => {
    const bus = new EventBus();
    const order = [];
    bus.on('test:event', async () => {
      await new Promise(r => setTimeout(r, 5));
      order.push('async');
    });
    bus.on('test:event', () => order.push('sync'));
    await bus.emitAsync('test:event');
    expect(order).toEqual(['sync', 'async']);
  });
});
