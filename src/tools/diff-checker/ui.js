import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function computeDiff(oldLines, newLines) {
  const oldLen = oldLines.length;
  const newLen = newLines.length;
  const dp = Array.from({ length: oldLen + 1 }, () => new Array(newLen + 1).fill(0));

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result = [];
  let i = oldLen, j = newLen;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'same', text: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: newLines[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'removed', text: oldLines[i - 1] });
      i--;
    }
  }
  return result;
}

function showDiffChecker({ editor, settings, container }) {
  const leftInput = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Original text...',
    spellcheck: 'false',
    rows: '6',
  });

  const rightInput = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Modified text...',
    spellcheck: 'false',
    rows: '6',
  });

  const output = tag('div', { className: 'dtk-tool-diff-output' });

  function compare() {
    const left = leftInput.value;
    const right = rightInput.value;
    if (!left && !right) {
      Toast({ message: 'Enter text in both panels', type: 'warning' });
      return;
    }
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const diff = computeDiff(leftLines, rightLines);
    output.textContent = '';
    for (const item of diff) {
      const line = tag('div', {
        className: `dtk-diff-line dtk-diff-${item.type}`,
        textContent: (item.type === 'added' ? '+ ' : item.type === 'removed' ? '- ' : '  ') + item.text,
      });
      output.append(line);
    }
  }

  function loadLeftFromEditor() {
    if (!editor) {
      Toast({ message: 'No editor available', type: 'warning' });
      return;
    }
    const content = editor.getContent();
    if (!content) {
      Toast({ message: 'Editor is empty', type: 'warning' });
      return;
    }
    leftInput.value = content;
  }

  function swapTexts() {
    const tmp = leftInput.value;
    leftInput.value = rightInput.value;
    rightInput.value = tmp;
  }

  function clearAll() {
    leftInput.value = '';
    rightInput.value = '';
    output.textContent = '';
  }

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('div', { className: 'dtk-tool-split' }, [
      tag('div', { className: 'dtk-tool-split-pane' }, [
        tag('label', { className: 'dtk-tool-label', textContent: 'Original' }),
        leftInput,
      ]),
      tag('div', { className: 'dtk-tool-split-pane' }, [
        tag('label', { className: 'dtk-tool-label', textContent: 'Modified' }),
        rightInput,
      ]),
    ]),
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-primary',
        textContent: 'Compare',
        onclick: compare,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: '\u21C4 Swap',
        onclick: swapTexts,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Load from Editor',
        onclick: loadLeftFromEditor,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Clear',
        onclick: clearAll,
      }),
    ]),
    tag('label', { className: 'dtk-tool-label', textContent: 'Differences' }),
    output,
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'Diff Checker', body });
  }
}

export { showDiffChecker };
