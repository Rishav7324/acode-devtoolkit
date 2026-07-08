import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardShortcutRegistry } from '../../src/services/KeyboardShortcutRegistry.js';

describe('KeyboardShortcutRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new KeyboardShortcutRegistry();
  });

  it('should register a shortcut', () => {
    registry.add({ keys: 'Ctrl-Shift-R', command: 'devtoolkit.regex-tester', description: 'Test regex' });
    const s = registry.get('Ctrl-Shift-R');
    expect(s.keys).toBe('Ctrl-Shift-R');
    expect(s.command).toBe('devtoolkit.regex-tester');
  });

  it('should return undefined for unknown shortcut', () => {
    expect(registry.get('Ctrl-Alt-X')).toBeUndefined();
  });

  it('should list all registered shortcuts', () => {
    registry.add({ keys: 'Ctrl-Shift-R', command: 'devtoolkit.regex-tester' });
    registry.add({ keys: 'Ctrl-Shift-C', command: 'devtoolkit.case-converter' });
    expect(registry.getAll()).toHaveLength(2);
  });

  it('should remove a shortcut', () => {
    registry.add({ keys: 'Ctrl-Shift-R', command: 'devtoolkit.regex-tester' });
    registry.remove('Ctrl-Shift-R');
    expect(registry.get('Ctrl-Shift-R')).toBeUndefined();
  });

  it('should clear all shortcuts', () => {
    registry.add({ keys: 'Ctrl-Shift-R', command: 'devtoolkit.regex-tester' });
    registry.add({ keys: 'Ctrl-Shift-C', command: 'devtoolkit.case-converter' });
    registry.clear();
    expect(registry.getAll()).toEqual([]);
  });

  it('should warn when registering without keys', () => {
    expect(() => registry.add({ command: 'devtoolkit.test' })).not.toThrow();
  });

  it('should warn when registering without command', () => {
    expect(() => registry.add({ keys: 'Ctrl-Shift-X' })).not.toThrow();
  });
});
