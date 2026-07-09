import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolRegistry } from '../../src/registries/ToolRegistry.js';
import { TOOL_CATEGORIES } from '../../src/data/tools.js';

function validTool(overrides = {}) {
  return {
    id: 'test-tool',
    slug: 'test-tool',
    name: 'Test Tool',
    description: 'A test tool description',
    icon: '\u2699',
    category: 'converters',
    launch: vi.fn(),
    ...overrides,
  };
}

describe('ToolRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new ToolRegistry(TOOL_CATEGORIES);
  });

  it('should register a valid tool', () => {
    const tool = validTool();
    const result = registry.register(tool);
    expect(result.success).toBe(true);
    const got = registry.get('test-tool');
    expect(got.id).toBe('test-tool');
    expect(got.name).toBe('Test Tool');
    expect(got.category).toBe('converters');
  });

  it('should return all registered tools', () => {
    registry.register(validTool({ id: 'a', name: 'A' }));
    registry.register(validTool({ id: 'b', name: 'B' }));
    expect(registry.getAll()).toHaveLength(2);
  });

  it('should get a tool by id', () => {
    registry.register(validTool({ id: 'my-tool', name: 'My Tool' }));
    const got = registry.get('my-tool');
    expect(got.id).toBe('my-tool');
    expect(got.name).toBe('My Tool');
  });

  it('should return null for unknown tool', () => {
    expect(registry.get('nonexistent')).toBeNull();
  });

  it('should group tools by category via getByCategory()', () => {
    registry.register(validTool({ id: 'c1', name: 'C1', category: 'converters' }));
    registry.register(validTool({ id: 's1', name: 'S1', category: 'security' }));
    const grouped = registry.getByCategory();
    expect(grouped.converters.tools).toHaveLength(1);
    expect(grouped.converters.tools[0].id).toBe('c1');
    expect(grouped.security.tools).toHaveLength(1);
    expect(grouped.security.tools[0].id).toBe('s1');
  });

  it('should search tools by name', () => {
    registry.register(validTool({ id: 'json-fmt', name: 'JSON Formatter' }));
    const results = registry.search('json');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('json-fmt');
  });

  it('should search tools by description', () => {
    registry.register(validTool({
      id: 'hash-gen',
      name: 'Hash Gen',
      description: 'Generate hashes',
    }));
    const results = registry.search('hashes');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('hash-gen');
  });

  it('should return empty array for search with no matches', () => {
    registry.register(validTool({ id: 't', name: 'Test' }));
    expect(registry.search('zzzzz')).toEqual([]);
  });

  it('should launch a tool via its launch handler through registry.launch', () => {
    const handler = vi.fn();
    registry.register(validTool({ id: 'test-tool', launch: handler }));
    const result = registry.launch('test-tool');
    expect(result.success).toBe(true);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('should return error launching an unregistered tool', () => {
    const result = registry.launch('nonexistent');
    expect(result.success).toBe(false);
    expect(result.error).toBe('NOT_FOUND');
  });

  it('should return error launching a tool with no handler', () => {
    const def = validTool({ id: 'no-handler' });
    delete def.launch;
    registry.register(def);
    const result = registry.launch('no-handler');
    expect(result.success).toBe(false);
    expect(result.error).toBe('NO_LAUNCH_HANDLER');
  });

  it('should clear all tools', () => {
    registry.register(validTool({ id: 't', name: 'T' }));
    registry.clear();
    expect(registry.getAll()).toEqual([]);
    expect(registry.getRecent()).toEqual([]);
    expect(registry.getFavorites()).toEqual([]);
    expect(registry.getValidationErrors()).toEqual([]);
  });

  it('should return categories', () => {
    expect(registry.getCategories()).toEqual(TOOL_CATEGORIES);
  });

  it('should reject duplicate tool ids', () => {
    registry.register(validTool({ id: 'dup', name: 'Dup' }));
    const result = registry.register(validTool({ id: 'dup', name: 'Dup2' }));
    expect(result.success).toBe(false);
    expect(result.duplicate).toBe(true);
  });

  it('should reject tools with missing required fields', () => {
    const result = registry.register({ id: 'no-name' });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject tools with unknown category', () => {
    const result = registry.register(validTool({ category: 'nonexistent' }));
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('Unknown category'))).toBe(true);
  });

  it('should pass args through registry.launch', () => {
    const handler = vi.fn();
    registry.register(validTool({ id: 't', launch: handler }));
    registry.launch('t', { foo: 'bar' });
    expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should track recently used tools', () => {
    registry.register(validTool({ id: 'a', name: 'A' }));
    registry.register(validTool({ id: 'b', name: 'B' }));
    registry.register(validTool({ id: 'c', name: 'C' }));
    registry.launch('a');
    registry.launch('b');
    registry.launch('c');
    const recent = registry.getRecent();
    expect(recent).toHaveLength(3);
    expect(recent[0].id).toBe('c');
    expect(recent[1].id).toBe('b');
    expect(recent[2].id).toBe('a');
  });

  it('should toggle favorites', () => {
    registry.register(validTool({ id: 'fav', name: 'Fav' }));
    expect(registry.isFavorite('fav')).toBe(false);
    registry.toggleFavorite('fav');
    expect(registry.isFavorite('fav')).toBe(true);
    const favs = registry.getFavorites();
    expect(favs).toHaveLength(1);
    expect(favs[0].id).toBe('fav');
    registry.toggleFavorite('fav');
    expect(registry.isFavorite('fav')).toBe(false);
  });

  it('should return validation errors', () => {
    registry.register({ id: 'bad' });
    const errors = registry.getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].id).toBe('bad');
  });
});
