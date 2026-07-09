import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'ON',
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
  'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'BETWEEN', 'LIKE', 'EXISTS', 'UNION', 'ALL', 'CASE',
  'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CASCADE',
  'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
];

function formatSql(sql) {
  let result = sql.trim();
  result = result.replace(/\s+/g, ' ');

  const keywordRegex = new RegExp(
    `\\b(${KEYWORDS.join('|')})\\b`,
    'gi'
  );

  result = result.replace(keywordRegex, match => `\n${match.toUpperCase()}`);
  result = result.replace(/\n\s*\n/g, '\n');
  result = result.replace(/,/g, ',\n  ');
  result = result.replace(/\(SELECT/gi, '(\nSELECT');
  result = result.replace(/\)/g, '\n)');
  result = result.trim();

  const lines = result.split('\n');
  let indent = 0;
  const formatted = lines.map((line, i) => {
    const trimmed = line.trim();
    if (/^(\)|\)\s*,|\)\s*(ORDER|LIMIT|GROUP))/i.test(trimmed)) {
      indent = Math.max(0, indent - 1);
    }
    const prefix = '  '.repeat(Math.max(0, indent));
    if (/\((SELECT|VALUES|CASE)/i.test(trimmed) || /\(\s*$/.test(trimmed)) {
      indent++;
    }
    if (i > 0 && /^\s*(JOIN|ON|AND|OR|SET|VALUES)/i.test(trimmed) && !/^\s*(ORDER|GROUP)/i.test(trimmed)) {
      return prefix + '  ' + trimmed;
    }
    return prefix + trimmed;
  }).join('\n');

  return formatted;
}

function showSqlFormatter({ editor, settings, container }) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Paste your SQL query here...',
    spellcheck: 'false',
  });

  const output = tag('pre', { className: 'dtk-tool-output' });

  function format() {
    const raw = input.value.trim();
    if (!raw) {
      Toast({ message: 'No SQL to format', type: 'warning' });
      return;
    }
    try {
      const formatted = formatSql(raw);
      output.textContent = formatted;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Format error: ${e.message}`, type: 'error' });
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
    input.value = content;
    format();
  }

  function copyOutput() {
    const text = output.textContent;
    if (!text) {
      Toast({ message: 'Nothing to copy', type: 'warning' });
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      Toast({ message: 'Copied to clipboard', type: 'success' });
    }).catch(() => {
      Toast({ message: 'Failed to copy', type: 'error' });
    });
  }

  function insertToEditor() {
    const text = output.textContent;
    if (!text) {
      Toast({ message: 'Nothing to insert', type: 'warning' });
      return;
    }
    if (!editor) {
      Toast({ message: 'No editor available', type: 'warning' });
      return;
    }
    editor.insertAtCursor(text);
    Toast({ message: 'Inserted at cursor', type: 'success' });
  }

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'SQL Input' }),
    input,
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-primary',
        textContent: 'Format SQL',
        onclick: format,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Load from Editor',
        onclick: loadFromEditor,
      }),
    ]),
    tag('label', { className: 'dtk-tool-label', textContent: 'Formatted SQL' }),
    output,
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Copy Output',
        onclick: copyOutput,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Insert to Editor',
        onclick: insertToEditor,
      }),
    ]),
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'SQL Formatter', body });
  }
}

export { showSqlFormatter };
