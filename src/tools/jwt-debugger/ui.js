import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return atob(str);
  }
}

function parseJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 parts separated by dots');
  }
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  const signature = parts[2];
  return { header, payload, signature };
}

function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function tokenExpired(payload) {
  if (!payload.exp) return 'N/A (no expiration)';
  const exp = new Date(payload.exp * 1000);
  const now = new Date();
  return exp < now ? `Expired at ${exp.toISOString()}` : `Valid until ${exp.toISOString()}`;
}

function showJwtDebugger({ editor, settings, container }) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Paste your JWT token here...',
    spellcheck: 'false',
    rows: '4',
  });

  const headerOutput = tag('pre', { className: 'dtk-tool-output dtk-tool-output-sm' });
  const payloadOutput = tag('pre', { className: 'dtk-tool-output dtk-tool-output-sm' });
  const sigOutput = tag('pre', { className: 'dtk-tool-output dtk-tool-output-sm' });
  const infoOutput = tag('div', { className: 'dtk-tool-status' });

  function decode() {
    const raw = input.value.trim();
    if (!raw) {
      Toast({ message: 'No JWT token provided', type: 'warning' });
      return;
    }
    try {
      const { header, payload, signature } = parseJwt(raw);
      headerOutput.textContent = formatJson(header);
      payloadOutput.textContent = formatJson(payload);
      sigOutput.textContent = signature;

      const alg = header.alg || 'unknown';
      const typ = header.typ || 'JWT';
      const expInfo = tokenExpired(payload);
      infoOutput.textContent = `Algorithm: ${alg} | Type: ${typ} | ${expInfo}`;
    } catch (e) {
      headerOutput.textContent = '';
      payloadOutput.textContent = '';
      sigOutput.textContent = '';
      infoOutput.textContent = '';
      Toast({ message: `JWT error: ${e.message}`, type: 'error' });
    }
  }

  function clearAll() {
    input.value = '';
    headerOutput.textContent = '';
    payloadOutput.textContent = '';
    sigOutput.textContent = '';
    infoOutput.textContent = '';
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
    decode();
  }

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'JWT Token' }),
    input,
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-primary',
        textContent: 'Decode Token',
        onclick: decode,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Clear',
        onclick: clearAll,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Load from Editor',
        onclick: loadFromEditor,
      }),
    ]),
    infoOutput,
    tag('label', { className: 'dtk-tool-label', textContent: 'Header' }),
    headerOutput,
    tag('label', { className: 'dtk-tool-label', textContent: 'Payload' }),
    payloadOutput,
    tag('label', { className: 'dtk-tool-label', textContent: 'Signature' }),
    sigOutput,
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'JWT Debugger', body });
  }
}

export { showJwtDebugger };
