import tag from 'html-tag-js';

export function Card({ icon, title, description, category, favorite, onFavorite, onLaunch }) {
  const favBtn = tag('button', {
    className: `dtk-btn-icon${favorite ? ' is-favorite' : ''}`,
    textContent: favorite ? '\u2665' : '\u2661',
    onclick: (e) => {
      e.stopPropagation();
      if (onFavorite) onFavorite();
    },
  });

  const root = tag('div', { className: 'dtk-card' }, [
    tag('div', { className: 'dtk-card-icon', textContent: icon || '\u2699' }),
    tag('h3', { className: 'dtk-card-title', textContent: title }),
    tag('p', { className: 'dtk-card-desc', textContent: description }),
    tag('div', { className: 'dtk-card-footer' }, [
      tag('span', { className: 'dtk-card-badge', textContent: category || '' }),
      tag('div', { className: 'dtk-card-actions' }, [
        favBtn,
        tag('button', {
          className: 'dtk-btn dtk-btn-primary dtk-launch-btn',
          textContent: 'Launch',
          onclick: (e) => {
            e.stopPropagation();
            if (onLaunch) onLaunch();
          },
        }),
      ]),
    ]),
  ]);

  return root;
}
