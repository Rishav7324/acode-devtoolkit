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

function mockLaunchService({ toolRegistry } = {}) {
  const registry = toolRegistry || new ToolRegistry(TOOL_CATEGORIES);
  return {
    sendToTool: vi.fn((toolId, text) => {
      const tool = registry.get(toolId);
      if (!tool || typeof tool.launch !== 'function') return false;
      tool.launch({ text });
      return true;
    }),
    getAvailableTools: vi.fn(() => registry.getEnabled().filter(t => typeof t.launch === 'function')),
  };
}

describe('SelectionService', () => {
  let toolRegistry;

  beforeEach(() => {
    toolRegistry = new ToolRegistry(TOOL_CATEGORIES);
  });

  it('should return null selection when no bridge', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: null, launchService: null });
    expect(svc.getSelection()).toBeNull();
  });

  it('should return null when bridge has no content', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge(null), launchService: null });
    expect(svc.getSelection()).toBeNull();
  });

  it('should return editor content via bridge', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge('hello'), launchService: null });
    expect(svc.getSelection()).toBe('hello');
  });

  it('should return false for sendToTool with no launch service', () => {
    const svc = createSelectionService({ toolRegistry, editorBridge: null, launchService: null });
    expect(svc.sendToTool('nonexistent', 'text')).toBe(false);
  });

  it('should return false for sendToTool with unknown tool', () => {
    const launchService = mockLaunchService({ toolRegistry });
    const svc = createSelectionService({ toolRegistry, editorBridge: null, launchService });
    expect(svc.sendToTool('nonexistent', 'text')).toBe(false);
  });

  it('should return false for tool with no launch handler', () => {
    toolRegistry.register({
      id: 'test-tool', slug: 'test-tool', name: 'Test', description: 'desc',
      icon: '\u2699', category: 'converters',
    });
    const launchService = mockLaunchService({ toolRegistry });
    const svc = createSelectionService({ toolRegistry, editorBridge: null, launchService });
    expect(svc.sendToTool('test-tool', 'text')).toBe(false);
  });

  it('should call tool launch when sending to tool', () => {
    const launch = vi.fn();
    toolRegistry.register({
      id: 'test-tool', slug: 'test-tool', name: 'Test', description: 'desc',
      icon: '\u2699', category: 'converters', launch,
    });
    const launchService = mockLaunchService({ toolRegistry });
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge('content'), launchService });
    expect(svc.sendToTool('test-tool', 'text')).toBe(true);
    expect(launch).toHaveBeenCalledWith({ text: 'text' });
  });

  it('should list available tools with launch handlers', () => {
    toolRegistry.register({
      id: 'active', slug: 'active', name: 'Active', description: 'desc',
      icon: '\u2699', category: 'converters', launch: vi.fn(),
    });
    toolRegistry.register({
      id: 'inactive', slug: 'inactive', name: 'Inactive', description: 'desc',
      icon: '\u2699', category: 'converters',
    });
    const launchService = mockLaunchService({ toolRegistry });
    const svc = createSelectionService({ toolRegistry, editorBridge: null, launchService });
    const available = svc.getAvailableTools();
    expect(available).toHaveLength(1);
    expect(available[0].id).toBe('active');
  });

  it('should expose getContent method', () => {
    const launchService = mockLaunchService({ toolRegistry });
    const svc = createSelectionService({ toolRegistry, editorBridge: mockEditorBridge('full content'), launchService });
    expect(svc.getContent()).toBe('full content');
  });
});
