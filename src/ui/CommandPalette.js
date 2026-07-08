import tag from 'html-tag-js';

export function CommandPalette({ toolRegistry, commandRegistry, searchRegistry }) {
  let _visible = false;
  let _selectedIndex = 0;
  let _results = [];

  const overlay = tag('div', { className: 'dtk-palette-overlay', onclick: hide });

  const panel = tag('div', {
    className: 'dtk-palette-panel',
    onclick: (e) => e.stopPropagation(),
  });

  const input = tag('input', {
    className: 'dtk-palette-input',
    type: 'text',
    placeholder: 'Search tools, commands, and actions...',
    autocomplete: 'off',
    'aria-label': 'Command palette search',
  });

  const resultsContainer = tag('div', { className: 'dtk-palette-results' });

  panel.append(input, resultsContainer);
  overlay.append(panel);

  function show() {
    if (_visible) return;
    _visible = true;
    _selectedIndex = 0;
    _results = [];
    input.value = '';
    resultsContainer.innerHTML = '';
    document.body.append(overlay);
    setTimeout(() => input.focus(), 50);
  }

  function hide() {
    if (!_visible) return;
    _visible = false;
    overlay.remove();
  }

  function search(query) {
    const q = query.toLowerCase().trim();
    const results = [];

    if (!q) {
      const allTools = toolRegistry.getAll();
      for (const tool of allTools) {
        results.push({ type: 'tool', label: tool.title, desc: tool.description, icon: tool.icon, tool });
      }
      return results;
    }

    const toolResults = toolRegistry.search(q);
    for (const tool of toolResults) {
      results.push({ type: 'tool', label: tool.title, desc: tool.description, icon: tool.icon, tool });
    }

    const allCommands = commandRegistry.getAll();
    for (const cmd of allCommands) {
      const nameMatch = cmd.name && cmd.name.toLowerCase().includes(q);
      const descMatch = cmd.description && cmd.description.toLowerCase().includes(q);
      if (nameMatch || descMatch) {
        results.push({ type: 'command', label: cmd.name, desc: cmd.description, icon: '\u2699', command: cmd });
      }
    }

    const searchResults = searchRegistry.search(q);
    for (const entry of searchResults) {
      results.push({ type: 'action', label: entry.keyword, desc: `Module: ${entry.moduleId}`, icon: '\u2606', handler: entry.handler, moduleId: entry.moduleId });
    }

    return results;
  }

  function render(query) {
    _results = search(query);
    _selectedIndex = 0;
    resultsContainer.innerHTML = '';

    if (_results.length === 0) {
      resultsContainer.append(tag('div', { className: 'dtk-palette-empty', textContent: 'No results found' }));
      return;
    }

    let currentType = '';
    for (let i = 0; i < _results.length; i++) {
      const item = _results[i];

      if (item.type !== currentType) {
        currentType = item.type;
        const typeLabel = { tool: 'Tools', command: 'Commands', action: 'Actions' }[currentType] || currentType;
        resultsContainer.append(tag('div', { className: 'dtk-palette-group', textContent: typeLabel }));
      }

      const row = tag('div', {
        className: 'dtk-palette-item',
        dataset: { index: i },
        onclick: () => select(i),
      }, [
        tag('span', { className: 'dtk-palette-item-icon', textContent: item.icon || '\u2699' }),
        tag('div', { className: 'dtk-palette-item-info' }, [
          tag('span', { className: 'dtk-palette-item-title', textContent: item.label }),
          item.desc ? tag('span', { className: 'dtk-palette-item-desc', textContent: item.desc }) : null,
        ]),
      ]);

      resultsContainer.append(row);
    }

    updateSelection();
  }

  function updateSelection() {
    const items = resultsContainer.querySelectorAll('.dtk-palette-item');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-selected', i === _selectedIndex);
    }
  }

  function select(index) {
    const item = _results[index];
    if (!item) return;

    hide();

    if (item.type === 'tool' && item.tool && toolRegistry.hasLaunchHandler(item.tool.id)) {
      toolRegistry.launch(item.tool.id);
    } else if (item.type === 'command' && item.command) {
      try {
        const commands = acode.require('commands');
        commands.registry.execute(item.command.name);
      } catch (e) {}
    } else if (item.type === 'action' && item.handler) {
      try {
        item.handler();
      } catch (e) {}
    }
  }

  input.oninput = () => render(input.value);

  input.onkeydown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _selectedIndex = Math.min(_selectedIndex + 1, _results.length - 1);
      const items = resultsContainer.querySelectorAll('.dtk-palette-item');
      if (items[_selectedIndex]) {
        items[_selectedIndex].scrollIntoView({ block: 'nearest' });
      }
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _selectedIndex = Math.max(_selectedIndex - 1, 0);
      const items = resultsContainer.querySelectorAll('.dtk-palette-item');
      if (items[_selectedIndex]) {
        items[_selectedIndex].scrollIntoView({ block: 'nearest' });
      }
      updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(_selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    }
  };

  return {
    show,
    hide,
    get isVisible() { return _visible; },
  };
}
