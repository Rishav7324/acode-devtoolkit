import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TOOL_CATEGORIES } from '../../src/data/tools.js';
import { ToolRegistry } from '../../src/registries/ToolRegistry.js';
import * as ModalModule from '../../src/ui/Modal.js';
import * as ToastModule from '../../src/ui/Toast.js';

vi.mock('../../src/ui/Modal.js', () => ({
  Modal: vi.fn(),
}));

vi.mock('../../src/ui/Toast.js', () => ({
  Toast: vi.fn(),
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

describe('ToolPicker', () => {
  let toolRegistry;
  let selectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    toolRegistry = new ToolRegistry(TOOL_CATEGORIES);
  });

  async function getToolPicker() {
    const { ToolPicker } = await import('../../src/ui/ToolPicker.js');
    return ToolPicker;
  }

  it('should show warning when no tools available', async () => {
    const ToolPicker = await getToolPicker();
    selectionService = { getAvailableTools: () => [] };
    ToolPicker({ toolRegistry, selectionService, editorBridge: null });
    expect(ToastModule.Toast).toHaveBeenCalledWith(expect.objectContaining({ message: 'No tools available' }));
  });

  it('should open modal with tool list', async () => {
    const launch = vi.fn();
    toolRegistry.register({ id: 'test1', title: 'Alpha', category: 'converters', description: 'First tool', launch });
    toolRegistry.register({ id: 'test2', title: 'Beta', category: 'formatters', description: 'Second tool', launch: vi.fn() });

    const ToolPicker = await getToolPicker();
    selectionService = { getAvailableTools: () => toolRegistry.getToolsWithLaunch() };
    ToolPicker({ toolRegistry, selectionService, editorBridge: null });

    expect(ModalModule.Modal).toHaveBeenCalledWith(expect.objectContaining({ title: 'Open Tool' }));
    const modalArgs = ModalModule.Modal.mock.calls[0][0];
    expect(modalArgs.title).toBe('Open Tool');
    expect(modalArgs.body).toBeTruthy();

    const searchInput = modalArgs.body.querySelector('.dtk-tool-input');
    expect(searchInput).toBeTruthy();
    expect(searchInput.placeholder).toBe('Search tools...');

    const items = modalArgs.body.querySelectorAll('.dtk-tool-picker-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('Alpha');
    expect(items[1].textContent).toContain('Beta');
  });

  it('should filter tools by search query', async () => {
    const launch = vi.fn();
    toolRegistry.register({ id: 'test1', title: 'Alpha', category: 'converters', description: 'First tool', launch });
    toolRegistry.register({ id: 'test2', title: 'Beta', category: 'formatters', description: 'Second tool', launch: vi.fn() });

    const ToolPicker = await getToolPicker();
    selectionService = { getAvailableTools: () => toolRegistry.getToolsWithLaunch() };
    ToolPicker({ toolRegistry, selectionService, editorBridge: null });

    const modalArgs = ModalModule.Modal.mock.calls[0][0];
    const searchInput = modalArgs.body.querySelector('.dtk-tool-input');

    searchInput.value = 'beta';
    searchInput.dispatchEvent(new Event('input'));

    const items = modalArgs.body.querySelectorAll('.dtk-tool-picker-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Beta');
  });

  it('should show empty state when no tools match', async () => {
    toolRegistry.register({ id: 'test1', title: 'Alpha', category: 'converters', description: 'First tool', launch: vi.fn() });

    const ToolPicker = await getToolPicker();
    selectionService = { getAvailableTools: () => toolRegistry.getToolsWithLaunch() };
    ToolPicker({ toolRegistry, selectionService, editorBridge: null });

    const modalArgs = ModalModule.Modal.mock.calls[0][0];
    const searchInput = modalArgs.body.querySelector('.dtk-tool-input');

    searchInput.value = 'zzzzzz';
    searchInput.dispatchEvent(new Event('input'));

    const empty = modalArgs.body.querySelector('.dtk-tool-picker-empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toBe('No matching tools');
  });

  it('should show "Send to Tool" title when text is selected', async () => {
    toolRegistry.register({ id: 'test1', title: 'Alpha', category: 'converters', description: 'First tool', launch: vi.fn() });

    const ToolPicker = await getToolPicker();
    selectionService = { getAvailableTools: () => toolRegistry.getToolsWithLaunch() };
    ToolPicker({ toolRegistry, selectionService, editorBridge: { getSelection: () => 'selected-text' } });

    expect(ModalModule.Modal).toHaveBeenCalledWith(expect.objectContaining({ title: 'Send to Tool' }));
  });

  it('should call tool launch with text when selected', async () => {
    const launch = vi.fn();
    toolRegistry.register({ id: 'test1', title: 'Alpha', category: 'converters', description: 'First tool', launch });

    const ToolPicker = await getToolPicker();
    selectionService = { getAvailableTools: () => toolRegistry.getToolsWithLaunch() };
    ToolPicker({ toolRegistry, selectionService, editorBridge: { getSelection: () => 'selected-text', getContent: () => 'full', insertAtCursor: vi.fn() } });

    const modalArgs = ModalModule.Modal.mock.calls[0][0];
    const item = modalArgs.body.querySelector('.dtk-tool-picker-item');
    item.click();

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ text: 'selected-text' }));
  });

  it('should call tool launch without text when no selection', async () => {
    const launch = vi.fn();
    toolRegistry.register({ id: 'test1', title: 'Alpha', category: 'converters', description: 'First tool', launch });

    const ToolPicker = await getToolPicker();
    selectionService = { getAvailableTools: () => toolRegistry.getToolsWithLaunch() };
    ToolPicker({ toolRegistry, selectionService, editorBridge: { getSelection: () => null, getContent: () => 'full', insertAtCursor: vi.fn() } });

    const modalArgs = ModalModule.Modal.mock.calls[0][0];
    const item = modalArgs.body.querySelector('.dtk-tool-picker-item');
    item.click();

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ settings: null, editor: expect.any(Object) }));
    expect(launch.mock.calls[0][0].text).toBeUndefined();
  });
});
