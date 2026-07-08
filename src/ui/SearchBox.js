import tag from 'html-tag-js';

export function SearchBox({ placeholder, onSearch, onClear, onSelect }) {
  const input = tag('input', {
    className: 'dtk-search-input',
    type: 'text',
    placeholder: placeholder || 'Search tools...',
    autocomplete: 'off',
  });

  const clearBtn = tag('button', {
    className: 'dtk-search-clear',
    textContent: '\u2715',
    onclick: () => {
      input.value = '';
      input.focus();
      if (onClear) onClear();
      clearBtn.classList.remove('is-visible');
    },
  });

  const root = tag('div', { className: 'dtk-search' }, [
    tag('span', { className: 'dtk-search-icon', textContent: '\u2315' }),
    input,
    clearBtn,
  ]);

  let debounceTimer;

  input.oninput = () => {
    clearBtn.classList.toggle('is-visible', input.value.length > 0);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (onSearch) onSearch(input.value);
    }, 200);
  };

  root.getValue = () => input.value;
  root.setValue = (val) => {
    input.value = val;
    clearBtn.classList.toggle('is-visible', val.length > 0);
  };
  root.clear = () => {
    input.value = '';
    clearBtn.classList.remove('is-visible');
    if (onClear) onClear();
  };
  root.focus = () => input.focus();

  return root;
}
