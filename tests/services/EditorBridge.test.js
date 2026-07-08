import { describe, it, expect, vi } from 'vitest';
import { createEditorBridge } from '../../src/services/EditorBridge.js';

function mockEditorService(editor) {
  return { getEditor: () => editor };
}

describe('EditorBridge', () => {
  it('should return null getContent with no editor', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.getContent()).toBeNull();
  });

  it('should get content from editor', () => {
    const editor = { getContent: () => 'hello' };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getContent()).toBe('hello');
  });

  it('should return null getContent on error', () => {
    const editor = { getContent: () => { throw new Error('fail'); } };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getContent()).toBeNull();
  });

  it('should return false setContent with no editor', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.setContent('text')).toBe(false);
  });

  it('should set content on editor', () => {
    const setContent = vi.fn();
    const editor = { setContent };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.setContent('new text')).toBe(true);
    expect(setContent).toHaveBeenCalledWith('new text');
  });

  it('should return null getSelection with no editor', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.getSelection()).toBeNull();
  });

  it('should get full selection when no getSelectionRange', () => {
    const editor = { getContent: () => 'full text' };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getSelection()).toBe('full text');
  });

  it('should get selected range', () => {
    const editor = {
      getContent: () => 'line1\nline2\nline3',
      getSelectionRange: () => ({ start: { row: 1, column: 2 }, end: { row: 1, column: 5 } }),
    };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getSelection()).toBe('ne2');
  });

  it('should get multi-line selection', () => {
    const editor = {
      getContent: () => 'line1\nline2\nline3\nline4',
      getSelectionRange: () => ({ start: { row: 0, column: 2 }, end: { row: 2, column: 3 } }),
    };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getSelection()).toBe('ne1\nline2\nlin');
  });

  it('should return false insertAtCursor with no editor', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.insertAtCursor('text')).toBe(false);
  });

  it('should insert at cursor', () => {
    const insertAtCursor = vi.fn();
    const editor = { insertAtCursor };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.insertAtCursor('inserted')).toBe(true);
    expect(insertAtCursor).toHaveBeenCalledWith('inserted');
  });

  it('should return false replaceSelection with no editor', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.replaceSelection('text')).toBe(false);
  });

  it('should replace selection using replaceSelection method', () => {
    const replaceSelection = vi.fn();
    const editor = { replaceSelection };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.replaceSelection('replaced')).toBe(true);
    expect(replaceSelection).toHaveBeenCalledWith('replaced');
  });

  it('should return null getCursorPosition without editor', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.getCursorPosition()).toBeNull();
  });

  it('should get cursor position', () => {
    const editor = { getCursorPosition: () => ({ row: 5, column: 10 }) };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getCursorPosition()).toEqual({ row: 5, column: 10 });
  });

  it('should return 0 getLineCount with no content', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.getLineCount()).toBe(0);
  });

  it('should count lines', () => {
    const editor = { getContent: () => 'a\nb\nc' };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getLineCount()).toBe(3);
  });

  it('should return null getFileName without editor', () => {
    const bridge = createEditorBridge(null);
    expect(bridge.getFileName()).toBeNull();
  });

  it('should get file name', () => {
    const editor = { getFile: () => ({ name: 'test.js' }) };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getFileName()).toBe('test.js');
  });

  it('should return null getFileName on error', () => {
    const editor = { getFile: () => { throw new Error('fail'); } };
    const bridge = createEditorBridge(mockEditorService(editor));
    expect(bridge.getFileName()).toBeNull();
  });
});
