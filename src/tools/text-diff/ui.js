import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function analyzeText(text) {
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;
  const sentenceCount = text ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const paragraphCount = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const readingTime = Math.ceil(wordCount / 200);
  const speakingTime = Math.ceil(wordCount / 130);

  return {
    charCount,
    charCountNoSpaces,
    wordCount,
    lineCount,
    sentenceCount,
    paragraphCount,
    readingTime,
    speakingTime,
  };
}

function showTextStatistics({ editor, settings, container }) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Paste or type text to analyze...',
    spellcheck: 'true',
  });

  const statsContainer = tag('div', { className: 'dtk-text-stats' });

  function analyze() {
    const text = input.value;
    const stats = analyzeText(text);

    const fields = [
      { label: 'Characters (total)', value: stats.charCount.toLocaleString() },
      { label: 'Characters (no spaces)', value: stats.charCountNoSpaces.toLocaleString() },
      { label: 'Words', value: stats.wordCount.toLocaleString() },
      { label: 'Lines', value: stats.lineCount.toLocaleString() },
      { label: 'Sentences', value: stats.sentenceCount.toLocaleString() },
      { label: 'Paragraphs', value: stats.paragraphCount.toLocaleString() },
      { label: 'Reading Time', value: `${stats.readingTime} min` },
      { label: 'Speaking Time', value: `${stats.speakingTime} min` },
    ];

    statsContainer.textContent = '';
    const grid = tag('div', { className: 'dtk-stats-grid' });
    for (const field of fields) {
      const card = tag('div', { className: 'dtk-stat-card' }, [
        tag('div', { className: 'dtk-stat-value', textContent: field.value }),
        tag('div', { className: 'dtk-stat-label', textContent: field.label }),
      ]);
      grid.append(card);
    }
    statsContainer.append(grid);
  }

  input.oninput = analyze;

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
    analyze();
  }

  analyze();

  const body = tag('div', { className: 'dtk-tool-body' }, [
    input,
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Load from Editor',
      onclick: loadFromEditor,
    }),
    statsContainer,
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'Text Statistics', body });
  }
}

export { showTextStatistics };
