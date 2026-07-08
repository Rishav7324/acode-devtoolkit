import { describe, it, expect, vi } from 'vitest';
import { createSelectionService } from '../../src/services/SelectionService.js';
import { ToolRegistry } from '../../src/registries/ToolRegistry.js';
import { TOOL_CATEGORIES } from '../../src/data/tools.js';

function mockEditorBridge(content) {
  return {
    getSelection: () => content,
    getContent: () => content,
    insertAtCursor: vi.fn(),
  };
}

describe('SelectionService', () => {
  let toolRegistry;

  beforeEach(() => {
    toolRegistry = new ToolRegistry(TOOL_CATEGORIES);
  });

  it('should return null selection when no bridge', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: null });
    expect(svc.getSelection()).toBeNull();
  });

  it('should return null when bridge has no content', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge(null) });
    expect(svc.getSelection()).toBeNull();
  });

  it('should return editor content via bridge', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge('hello') });
    expect(svc.getSelection()).toBe('hello');
  });

  it('should return false for sendToTool with unknown tool', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: null });
    expect(svc.sendToTool('nonexistent', 'text')).toBe(false);
  });

  it('should return false for tool with no launch handler', () => {
    toolRegistry.register({ id: 'test-tool', title: 'Test', category: 'converters' });
    const svc = createSelectionService({ toolRegistry, editorBridge: null });
    expect(svc.sendToTool('test-tool', 'text')).toBe(false);
  });

  it('should call tool launch when sending to tool', () => {
    const launch = vi.fn();
    toolRegistry.register({ id: 'test-tool', title: 'Test', category: 'converters', launch });
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge('content') });
    expect(svc.sendToTool('test-tool', 'text')).toBe(true);
    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ text: 'text' }));
  });

  it('should list available tools with launch handlers', () => {
    toolRegistry.register({ id: 'active', title: 'Active', category: 'converters', launch: vi.fn() });
    toolRegistry.register({ id: 'inactive', title: 'Inactive', category: 'converters' });
    const svc = createSelectionService({ toolRegistry, editorBridge: null });
    const available = svc.getAvailableTools();
    expect(available).toHaveLength(1);
    expect(available[0].id).toBe('active');
  });

  it('should expose getContent method', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge('full content') });
    expect(svc.getContent()).toBe('full content');
  });
});
