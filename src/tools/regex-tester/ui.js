import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

export function showRegexTester({ editor, settings, text, container } = {}) {
  const patternInput = tag('input', {
    className: 'dtk-tool-input',
    placeholder: 'Enter regex pattern (e.g. \\d+)',
    spellcheck: 'false',
  });

  const flagsInput = tag('input', {
    className: 'dtk-tool-input dtk-tool-input-sm',
    placeholder: 'Flags (g, i, m, s, u, y)',
    value: 'gm',
    spellcheck: 'false',
  });

  const testInput = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Enter test string...',
    spellcheck: 'false',
  });

  const matchCount = tag('span', {
    className: 'dtk-tool-charcount',
    textContent: '0 matches',
  });

  const output = tag('pre', {
    className: 'dtk-tool-output',
  });

  function testRegex() {
    const pattern = patternInput.value.trim();
    const flags = flagsInput.value.trim();
    const testStr = testInput.value;

    if (!pattern) {
      matchCount.textContent = '0 matches';
      output.textContent = '';
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let m;

      if (flags.includes('g')) {
        while ((m = regex.exec(testStr)) !== null) {
          matches.push({
            full: m[0],
            index: m.index,
            groups: m.slice(1),
            named: m.groups || {},
          });
          if (m.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        m = regex.exec(testStr);
        if (m) {
          matches.push({
            full: m[0],
            index: m.index,
            groups: m.slice(1),
            named: m.groups || {},
          });
        }
      }

      matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;

      if (matches.length === 0) {
        output.textContent = 'No matches found';
        return;
      }

      const lines = matches.map((match, i) => {
        let line = `[${i + 1}] at ${match.index}: ${match.full}`;
        if (match.groups.length > 0) {
          line += `\n     Groups: ${match.groups.map((g, gi) => `$${gi + 1}=${g}`).join(', ')}`;
        }
        const namedKeys = Object.keys(match.named);
        if (namedKeys.length > 0) {
          line += `\n     Named: ${namedKeys.map(k => `${k}=${match.named[k]}`).join(', ')}`;
        }
        return line;
      });

      output.textContent = lines.join('\n');
    } catch (e) {
      matchCount.textContent = '0 matches';
      output.textContent = `Error: ${e.message}`;
    }
  }

  function loadFromEditor() {
    if (!editor) {
      Toast({ message: 'No editor available', type: 'warning' });
      return;
    }
    const content = editor.getContent();
    if (!content) {
      Toast({ message: 'Editor is empty', type: 'warning' });
      return;
    }
    testInput.value = content;
    testRegex();
    Toast({ message: 'Loaded from editor', type: 'info' });
  }

  if (text) { testInput.value = text; testRegex(); }

  patternInput.oninput = testRegex;
  flagsInput.oninput = testRegex;
  testInput.oninput = testRegex;

  const flagBar = tag('div', { className: 'dtk-tool-inline' }, [
    patternInput,
    flagsInput,
  ]);

  const actionBar = tag('div', { className: 'dtk-tool-actions' }, [
    tag('button', {
      className: 'dtk-btn dtk-btn-primary',
      textContent: 'Test',
      onclick: testRegex,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Load from Editor',
      onclick: loadFromEditor,
    }),
  ]);

  const statusBar = tag('div', { className: 'dtk-tool-status' }, [
    matchCount,
  ]);

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'Pattern & Flags' }),
    flagBar,
    tag('label', { className: 'dtk-tool-label', textContent: 'Test String' }),
    testInput,
    actionBar,
    tag('label', { className: 'dtk-tool-label', textContent: 'Matches' }),
    output,
    statusBar,
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'Regex Tester', body });
  }
}
