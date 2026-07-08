import tag from 'html-tag-js';
import { Header } from '../ui/Header.js';
import { SearchBox } from '../ui/SearchBox.js';
import { ToolCard } from '../ui/ToolCard.js';
import { EmptyState } from '../ui/EmptyState.js';

export function HomePage({ toolRegistry, onLaunchTool }) {
  const container = tag('div', { className: 'dtk-container' });

  const header = Header({
    greeting: 'DevToolkit',
    subtitle: 'Your essential development tools, always ready',
  });

  container.append(header);

  const searchBox = SearchBox({
    placeholder: 'Search all tools...',
    onSearch: (query) => {
      results.innerHTML = '';
      if (!query) {
        results.classList.remove('is-visible');
        return;
      }
      const matches = toolRegistry.search(query);
      results.classList.add('is-visible');

      if (matches.length === 0) {
        results.append(EmptyState({
          icon: '\u2315',
          title: 'No tools found',
          description: 'Try a different search term',
        }));
        return;
      }

      for (const tool of matches) {
        const item = tag('div', {
          className: 'dtk-search-result-item',
          onclick: () => {
            searchBox.clear();
            results.classList.remove('is-visible');
            if (onLaunchTool) onLaunchTool(tool);
          },
        }, [
          tag('div', { className: 'dtk-search-result-icon', textContent: tool.icon }),
          tag('div', { className: 'dtk-search-result-info' }, [
            tag('p', { className: 'dtk-search-result-title', textContent: tool.title }),
            tag('p', { className: 'dtk-search-result-category', textContent: tool.category }),
          ]),
        ]);
        results.append(item);
      }
    },
    onClear: () => {
      results.classList.remove('is-visible');
    },
  });

  container.append(searchBox);

  const results = tag('div', { className: 'dtk-search-results' });
  searchBox.after(results);

  const quickActions = tag('div', { className: 'dtk-quick-actions' });

  const QUICK_ACTIONS = [
    { icon: '\u2630', label: 'Formatter', category: 'formatting' },
    { icon: '\u26bf', label: 'Hash', category: 'security' },
    { icon: '\u26a1', label: 'Generator', category: 'generators' },
    { icon: '\u21c4', label: 'Converter', category: 'converters' },
    { icon: '\u2699', label: 'Utilities', category: 'developer' },
  ];

  for (const qa of QUICK_ACTIONS) {
    const btn = tag('button', {
      className: 'dtk-quick-btn',
      onclick: () => {
        const section = container.querySelector(`[data-category="${qa.category}"]`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
    }, [
      tag('span', { className: 'dtk-quick-btn-icon', textContent: qa.icon }),
      tag('span', { className: 'dtk-quick-btn-label', textContent: qa.label }),
    ]);
    quickActions.append(btn);
  }

  container.append(quickActions);

  const toolsByCategory = toolRegistry.getByCategory();

  const recentlyUsed = toolRegistry.getRecentlyUsed();

  if (recentlyUsed.length > 0) {
    const section = buildSection(
      'Recently Used',
      null,
      tag('div', { className: 'dtk-grid' },
        recentlyUsed.map((tool) =>
          ToolCard({
            tool,
            onLaunch: () => { if (onLaunchTool) onLaunchTool(tool); },
          })
        )
      )
    );
    container.append(section);
  }

  const categories = toolRegistry.getCategories();

  for (const cat of categories) {
    const group = toolsByCategory[cat.id];
    if (!group || group.tools.length === 0) continue;

    const section = buildSection(
      group.label,
      `View all ${group.tools.length} tools`,
      tag('div', { className: 'dtk-grid' },
        group.tools.map((tool) =>
          ToolCard({
            tool,
            onLaunch: () => { if (onLaunchTool) onLaunchTool(tool); },
          })
        )
      ),
      cat.id
    );
    container.append(section);
  }

  const upcoming = buildSection(
    'Coming Soon',
    null,
    tag('div', { className: 'dtk-upcoming-grid' }, [
      upcomingCard('\u{1f4c4}', 'CSS Grid Generator', 'Visual CSS grid builder'),
      upcomingCard('\u{1f310}', 'IP Locator', 'IP address geolocation'),
      upcomingCard('\u{1f4ca}', 'Data Visualizer', 'Chart and graph generator'),
      upcomingCard('\u{1f4e6}', 'API Tester', 'HTTP request builder and tester'),
    ])
  );
  container.append(upcoming);

  const footer = tag('div', { className: 'dtk-footer' }, [
    tag('p', { className: 'dtk-footer-text', textContent: 'Acode DevToolkit \u2014 Open source developer utilities' }),
    tag('p', { className: 'dtk-footer-version', textContent: 'v0.7.0 \u2014 MIT License' }),
  ]);
  container.append(footer);

  return container;
}

function buildSection(title, actionLabel, content, categoryId) {
  const section = tag('div', { className: 'dtk-section' });
  if (categoryId) section.dataset.category = categoryId;

  const header = tag('div', { className: 'dtk-section-header' }, [
    tag('h2', { className: 'dtk-section-title', textContent: title }),
  ]);

  if (actionLabel) {
    header.append(tag('button', {
      className: 'dtk-section-action',
      textContent: actionLabel,
    }));
  }

  section.append(header, content);
  return section;
}

function upcomingCard(icon, title, desc) {
  return tag('div', { className: 'dtk-upcoming-card' }, [
    tag('div', { className: 'dtk-upcoming-icon', textContent: icon }),
    tag('p', { className: 'dtk-upcoming-title', textContent: title }),
    tag('p', { className: 'dtk-upcoming-desc', textContent: desc }),
  ]);
}
