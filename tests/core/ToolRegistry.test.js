import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolRegistry } from '../../src/registries/ToolRegistry.js';
import { TOOL_CATEGORIES } from '../../src/data/tools.js';

describe('ToolRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new ToolRegistry(TOOL_CATEGORIES);
  });

  it('should register a tool', () => {
    const tool = { id: 'test-tool', title: 'Test Tool', category: 'converters' };
    registry.register(tool);
    const got = registry.get('test-tool');
    expect(got.id).toBe('test-tool');
    expect(got.title).toBe('Test Tool');
    expect(got.category).toBe('converters');
  });

  it('should return all registered tools', () => {
    registry.register({ id: 'a', title: 'A', category: 'converters' });
    registry.register({ id: 'b', title: 'B', category: 'converters' });
    expect(registry.getAll()).toHaveLength(2);
  });

  it('should get a tool by id', () => {
    registry.register({ id: 'my-tool', title: 'My Tool', category: 'converters' });
    const got = registry.get('my-tool');
    expect(got.id).toBe('my-tool');
    expect(got.title).toBe('My Tool');
  });

  it('should return undefined for unknown tool', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('should unregister a tool', () => {
    registry.register({ id: 'test-tool', title: 'Test Tool', category: 'converters' });
    registry.unregister('test-tool');
    expect(registry.get('test-tool')).toBeUndefined();
  });

  it('should group tools by category via getByCategory()', () => {
    registry.register({ id: 'c1', title: 'C1', category: 'converters' });
    registry.register({ id: 's1', title: 'S1', category: 'security' });
    const grouped = registry.getByCategory();
    expect(grouped.converters.tools).toHaveLength(1);
    expect(grouped.converters.tools[0].id).toBe('c1');
    expect(grouped.security.tools).toHaveLength(1);
    expect(grouped.security.tools[0].id).toBe('s1');
  });

  it('should search tools by title', () => {
    registry.register({ id: 'json-fmt', title: 'JSON Formatter', category: 'converters' });
    const results = registry.search('json');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('json-fmt');
  });

  it('should search tools by description', () => {
    registry.register({
      id: 'hash-gen',
      title: 'Hash Gen',
      description: 'Generate hashes',
      category: 'security',
    });
    const results = registry.search('hashes');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('hash-gen');
  });

  it('should return empty array for search with no matches', () => {
    registry.register({ id: 't', title: 'Test', category: 'converters' });
    expect(registry.search('zzzzz')).toEqual([]);
  });

  it('should launch a tool via its launch handler', () => {
    const handler = vi.fn();
    registry.register({
      id: 'test-tool',
      title: 'Test Tool',
      category: 'converters',
      launch: handler,
    });
    registry.launch('test-tool');
    expect(handler).toHaveBeenCalled();
  });

  it('should do nothing launching an unregistered tool', () => {
    expect(() => registry.launch('nonexistent')).not.toThrow();
  });

  it('should warn launching a tool with no handler', () => {
    registry.register({ id: 'no-handler', title: 'No Handler', category: 'converters' });
    expect(() => registry.launch('no-handler')).not.toThrow();
  });

  it('should check if a tool has a launch handler', () => {
    registry.register({
      id: 't',
      title: 'T',
      category: 'converters',
      launch: vi.fn(),
    });
    expect(registry.hasLaunchHandler('t')).toBe(true);
    expect(registry.hasLaunchHandler('nonexistent')).toBeUndefined();
  });

  it('should clear all tools', () => {
    registry.register({ id: 't', title: 'T', category: 'converters' });
    registry.clear();
    expect(registry.getAll()).toEqual([]);
  });

  it('should return categories', () => {
    expect(registry.getCategories()).toEqual(TOOL_CATEGORIES);
  });

  it('should not add duplicate tool ids', () => {
    registry.register({ id: 'dup', title: 'Dup', category: 'converters' });
    registry.register({ id: 'dup', title: 'Dup2', category: 'converters' });
    expect(registry.getAll()).toHaveLength(1);
  });

  it('should warn on registrations with no id', () => {
    expect(() => registry.register({ title: 'No ID' })).not.toThrow();
  });

  it('should get recently used tools', () => {
    registry.register({ id: 'a', title: 'A', category: 'converters' });
    registry.register({ id: 'b', title: 'B', category: 'converters' });
    registry.register({ id: 'c', title: 'C', category: 'converters' });
    registry.register({ id: 'd', title: 'D', category: 'converters' });
    registry.register({ id: 'e', title: 'E', category: 'converters' });
    const recent = registry.getRecentlyUsed();
    expect(recent).toHaveLength(4);
  });
});
