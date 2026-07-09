import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolRegistry } from '../../src/registries/ToolRegistry.js';
import { TOOL_CATEGORIES } from '../../src/data/tools.js';
import { ModuleManager } from '../../src/core/ModuleManager.js';
import { ModuleLoader } from '../../src/core/ModuleLoader.js';
import { DependencyResolver } from '../../src/core/DependencyResolver.js';
import { ErrorIsolation } from '../../src/core/ErrorIsolation.js';
import { EventBus } from '../../src/core/EventBus.js';

function createMockRegistries() {
  const mockReg = () => ({ register: vi.fn(), unregisterByModule: vi.fn() });
  return {
    commands: mockReg(),
    settings: mockReg(),
    storage: mockReg(),
    ui: mockReg(),
    theme: mockReg(),
    services: mockReg(),
    actions: mockReg(),
    search: mockReg(),
    permissions: mockReg(),
    tools: new ToolRegistry(TOOL_CATEGORIES),
  };
}

describe('Module lifecycle - all tools register correctly', () => {
  let eventBus;
  let registries;
  let toolRegistry;
  let mm;

  beforeEach(() => {
    eventBus = new EventBus();
    registries = createMockRegistries();
    toolRegistry = registries.tools;

    const resolver = new DependencyResolver();
    const loader = new ModuleLoader();
    const isolator = new ErrorIsolation(eventBus);
    mm = new ModuleManager(eventBus, registries, { resolver, loader, isolator });
  });

  it('all 17 tool modules register with launch handlers after startup', async () => {
    const { moduleDescriptors } = await import('../../src/modules/index.js');

    for (const desc of moduleDescriptors) {
      if (desc.id !== 'home') {
        await mm.load(desc);
      }
    }

    const context = {
      toolRegistry,
      services: {
        commands: { add: vi.fn(), remove: vi.fn(), get: vi.fn() },
        editor: { getEditor: vi.fn() },
        settings: { get: vi.fn() },
        notifications: { show: vi.fn() },
      },
      registries,
      baseUrl: '/',
    };

    const results = await mm.enableAll(context);

    const failed = results.filter(r => !r.success);
    expect(failed).toEqual([]);

    const allToolIds = toolRegistry.getAll().map(t => t.id);
    expect(allToolIds.length).toBe(17);

    for (const tool of toolRegistry.getAll()) {
      expect(typeof tool.launch).toBe('function');
    }
  });

  it('tool modules preserve metadata (name, icon, description)', async () => {
    const { moduleDescriptors } = await import('../../src/modules/index.js');
    const toolIds = ['regex-tester', 'case-converter', 'minifier'];

    for (const desc of moduleDescriptors) {
      if (desc.id !== 'home') {
        await mm.load(desc);
      }
    }

    const context = {
      toolRegistry,
      services: {
        commands: { add: vi.fn(), remove: vi.fn(), get: vi.fn() },
        editor: { getEditor: vi.fn() },
        settings: { get: vi.fn() },
        notifications: { show: vi.fn() },
      },
      registries,
      baseUrl: '/',
    };

    await mm.enableAll(context);

    for (const id of toolIds) {
      const tool = toolRegistry.get(id);
      expect(typeof tool.launch).toBe('function');
      expect(tool.icon).toBeTruthy();
      expect(tool.name).not.toBe(id);
      expect(tool.description).toBeTruthy();
    }
  });

  it('every registered tool has a launch function', async () => {
    const { moduleDescriptors } = await import('../../src/modules/index.js');

    for (const desc of moduleDescriptors) {
      if (desc.id !== 'home') {
        await mm.load(desc);
      }
    }

    const context = {
      toolRegistry,
      services: {
        commands: { add: vi.fn(), remove: vi.fn(), get: vi.fn() },
        editor: { getEditor: vi.fn() },
        settings: { get: vi.fn() },
        notifications: { show: vi.fn() },
      },
      registries,
      baseUrl: '/',
    };

    await mm.enableAll(context);

    for (const tool of toolRegistry.getAll()) {
      expect(typeof tool.launch).toBe('function');
    }
  });
});
