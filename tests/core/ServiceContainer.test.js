import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceContainer } from '../../src/core/ServiceContainer.js';

describe('ServiceContainer', () => {
  let container;

  beforeEach(() => {
    container = new ServiceContainer();
  });

  it('should register and resolve a service', () => {
    container.register('logger', () => ({ log: vi.fn() }));
    const logger = container.get('logger');
    expect(logger.log).toBeDefined();
  });

  it('should return the same instance for singleton (default)', () => {
    const factory = () => ({ id: Math.random() });
    container.register('random', factory);
    const a = container.get('random');
    const b = container.get('random');
    expect(a).toBe(b);
  });

  it('should return different instances for transient', () => {
    const factory = () => ({ id: Math.random() });
    container.register('random', factory, { lifetime: 'transient' });
    const a = container.get('random');
    const b = container.get('random');
    expect(a).not.toBe(b);
  });

  it('should return new instances for scoped when using getScoped', () => {
    const factory = () => ({ id: Math.random() });
    container.register('random', factory, { lifetime: 'scoped' });
    const a = container.getScoped('random');
    const b = container.getScoped('random');
    expect(a).not.toBe(b);
  });

  it('should throw when resolving an unregistered service', () => {
    expect(() => container.get('nonexistent')).toThrow();
  });

  it('should check if a service is registered via has()', () => {
    container.register('existing', () => ({}));
    expect(container.has('existing')).toBe(true);
    expect(container.has('missing')).toBe(null);
  });

  it('should register an instance directly', () => {
    const instance = { val: 42 };
    container.registerInstance('answer', instance);
    expect(container.get('answer')).toBe(instance);
  });

  it('should resolve dependencies from factory', () => {
    container.register('a', () => 'value-a');
    container.register('b', (a) => `value-b-${a}`, { dependencies: ['a'] });
    expect(container.get('b')).toBe('value-b-value-a');
  });

  it('should resolve multiple services with correct instances', () => {
    container.register('x', () => 10);
    container.register('y', () => 20);
    container.register('sum', (x, y) => x + y, { dependencies: ['x', 'y'] });
    expect(container.get('sum')).toBe(30);
  });

  it('should cache singletons after first resolution', () => {
    const factory = vi.fn(() => ({}));
    container.register('cache-test', factory);
    container.get('cache-test');
    container.get('cache-test');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should not cache transient services', () => {
    const factory = vi.fn(() => ({}));
    container.register('transient-test', factory, { lifetime: 'transient' });
    container.get('transient-test');
    container.get('transient-test');
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should detect circular dependencies', () => {
    container.register('a', (b) => `a-${b}`, { dependencies: ['b'] });
    container.register('b', (a) => `b-${a}`, { dependencies: ['a'] });
    expect(() => container.get('a')).toThrow(/circular dependency/i);
  });

  it('should call cleanup on registered services on destroy', () => {
    const cleanup = vi.fn();
    container.register('disposable', () => ({ name: 'test' }), { cleanup });
    container.get('disposable');
    container.destroy();
    expect(cleanup).toHaveBeenCalledWith({ name: 'test' });
  });

  it('should support child scopes via createScope()', () => {
    container.register('parent', () => 'from-parent');
    const child = container.createScope();
    expect(child.get('parent')).toBe('from-parent');
  });

  it('should isolate child scope for services registered on child', () => {
    container.register('root', () => 'root-val');
    const child = container.createScope();
    child.register('child-svc', () => 'child-val');
    expect(child.get('child-svc')).toBe('child-val');
    expect(container.has('child-svc')).toBe(null);
  });

  it('should return all services via getAll()', () => {
    container.register('a', () => 'A');
    container.register('b', () => 'B');
    const all = container.getAll();
    expect(all.a).toBe('A');
    expect(all.b).toBe('B');
  });
});
