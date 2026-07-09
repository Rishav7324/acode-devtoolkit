import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('html-tag-js', () => ({}));

describe('TabManager', () => {
  let TabManager;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../../src/services/TabManager.js');
    TabManager = mod.TabManager;
  });

  it('should create instance with isOpen = false', () => {
    const tm = new TabManager();
    expect(tm.isOpen).toBe(false);
    expect(tm.file).toBeNull();
  });

  it('should return null file when not open', () => {
    const tm = new TabManager();
    expect(tm.file).toBeNull();
  });

  it('should close safely when not open', () => {
    const tm = new TabManager();
    expect(() => tm.close()).not.toThrow();
  });

  it('should toggle when already closed opens', () => {
    const tm = new TabManager();
    const result = tm.toggle({
      toolRegistry: { getToolsWithLaunch: () => [] },
      selectionService: { getAvailableTools: () => [] },
      editorBridge: null,
    });
    expect(tm.isOpen).toBe(false); // still false because no acode
    expect(result).toBeUndefined();
  });
});
