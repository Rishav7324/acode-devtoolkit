import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur',
  'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa',
  'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

function randomWord() {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateWords(count) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(randomWord());
  }
  return words.join(' ');
}

function generateSentences(count) {
  const sentences = [];
  for (let i = 0; i < count; i++) {
    const wordCount = 5 + Math.floor(Math.random() * 10);
    const words = generateWords(wordCount);
    const sentence = words.charAt(0).toUpperCase() + words.slice(1) + '.';
    sentences.push(sentence);
  }
  return sentences.join(' ');
}

function generateParagraphs(count) {
  const paragraphs = [];
  for (let i = 0; i < count; i++) {
    const sentenceCount = 3 + Math.floor(Math.random() * 5);
    paragraphs.push(generateSentences(sentenceCount));
  }
  return paragraphs.join('\n\n');
}

function showLoremIpsum({ editor, settings, container }) {
  const modeSelect = tag('select', { className: 'dtk-tool-select' }, [
    tag('option', { value: 'paragraphs', textContent: 'Paragraphs' }),
    tag('option', { value: 'sentences', textContent: 'Sentences' }),
    tag('option', { value: 'words', textContent: 'Words' }),
  ]);

  const countInput = tag('input', {
    className: 'dtk-tool-input',
    type: 'number',
    value: '3',
    min: '1',
    max: '100',
  });

  const output = tag('pre', { className: 'dtk-tool-output' });

  function generate() {
    const mode = modeSelect.value;
    const count = parseInt(countInput.value, 10) || 3;
    let text;
    switch (mode) {
      case 'paragraphs': text = generateParagraphs(count); break;
      case 'sentences': text = generateSentences(count); break;
      case 'words': text = generateWords(count); break;
    }
    output.textContent = text;
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

  generate();

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('div', { className: 'dtk-tool-inline' }, [
      tag('label', { className: 'dtk-tool-label', textContent: 'Type:' }),
      modeSelect,
      tag('label', { className: 'dtk-tool-label', textContent: 'Count:' }),
      countInput,
    ]),
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-primary',
        textContent: 'Generate',
        onclick: generate,
      }),
    ]),
    tag('label', { className: 'dtk-tool-label', textContent: 'Output' }),
    output,
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Copy to Clipboard',
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
    Modal({ title: 'Lorem Ipsum Generator', body });
  }
}

export { showLoremIpsum };
