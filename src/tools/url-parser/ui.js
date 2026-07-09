import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function parseUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    try {
      parsed = new URL('https://' + url);
    } catch {
      throw new Error('Invalid URL');
    }
  }

  const params = {};
  parsed.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return {
    href: parsed.href,
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port || '(default)',
    host: parsed.host,
    pathname: parsed.pathname,
    search: parsed.search || '(none)',
    hash: parsed.hash || '(none)',
    origin: parsed.origin,
    params,
  };
}

function encodeUri(text) {
  return encodeURIComponent(text);
}

function decodeUri(text) {
  return decodeURIComponent(text);
}

function showUrlParser({ editor, settings, container }) {
  const tabs = tag('div', { className: 'dtk-tool-tabs' }, [
    tag('button', {
      className: 'dtk-tool-tab is-active',
      textContent: 'Parse URL',
      dataset: { tab: 'parse' },
      onclick: () => switchTab('parse'),
    }),
    tag('button', {
      className: 'dtk-tool-tab',
      textContent: 'Encode/Decode',
      dataset: { tab: 'encode' },
      onclick: () => switchTab('encode'),
    }),
  ]);

  const parseContent = tag('div', { className: 'dtk-tool-tab-content' });
  const encodeContent = tag('div', { className: 'dtk-tool-tab-content', style: 'display:none' });

  function switchTab(tab) {
    tabs.querySelectorAll('.dtk-tool-tab').forEach(t => t.classList.remove('is-active'));
    tabs.querySelector(`[data-tab="${tab}"]`).classList.add('is-active');
    parseContent.style.display = tab === 'parse' ? '' : 'none';
    encodeContent.style.display = tab === 'encode' ? '' : 'none';
  }

  const urlInput = tag('input', {
    className: 'dtk-tool-input',
    type: 'text',
    placeholder: 'Enter URL (e.g. https://example.com/path?q=hello#section)',
  });

  const parsedOutput = tag('div', { className: 'dtk-parsed-output' });

  function doParse() {
    const raw = urlInput.value.trim();
    if (!raw) {
      Toast({ message: 'Enter a URL to parse', type: 'warning' });
      return;
    }
    try {
      const result = parseUrl(raw);
      parsedOutput.textContent = '';

      const fields = [
        { label: 'Full URL', value: result.href },
        { label: 'Protocol', value: result.protocol },
        { label: 'Host', value: result.host },
        { label: 'Hostname', value: result.hostname },
        { label: 'Port', value: result.port },
        { label: 'Path', value: result.pathname },
        { label: 'Query String', value: result.search },
        { label: 'Hash', value: result.hash },
        { label: 'Origin', value: result.origin },
      ];

      for (const field of fields) {
        const row = tag('div', { className: 'dtk-parsed-row' }, [
          tag('div', { className: 'dtk-parsed-label', textContent: field.label }),
          tag('div', { className: 'dtk-parsed-value', textContent: field.value }),
        ]);
        parsedOutput.append(row);
      }

      const paramKeys = Object.keys(result.params);
      if (paramKeys.length > 0) {
        const paramsHeader = tag('div', { className: 'dtk-parsed-section-header', textContent: 'Query Parameters' });
        parsedOutput.append(paramsHeader);
        for (const key of paramKeys) {
          const row = tag('div', { className: 'dtk-parsed-row' }, [
            tag('div', { className: 'dtk-parsed-label', textContent: key }),
            tag('div', { className: 'dtk-parsed-value', textContent: result.params[key] }),
          ]);
          parsedOutput.append(row);
        }
      }
    } catch (e) {
      parsedOutput.textContent = '';
      Toast({ message: `Parse error: ${e.message}`, type: 'error' });
    }
  }

  urlInput.onkeydown = (e) => { if (e.key === 'Enter') doParse(); };

  parseContent.append(
    urlInput,
    tag('button', {
      className: 'dtk-btn dtk-btn-primary',
      textContent: 'Parse URL',
      onclick: doParse,
      style: 'margin: 8px 0;',
    }),
    parsedOutput
  );

  const encInput = tag('input', {
    className: 'dtk-tool-input',
    type: 'text',
    placeholder: 'Text to encode/decode...',
  });

  const encOutput = tag('pre', { className: 'dtk-tool-output dtk-tool-output-sm' });

  function doEncode() {
    const raw = encInput.value;
    if (!raw) {
      Toast({ message: 'No text to encode', type: 'warning' });
      return;
    }
    try {
      encOutput.textContent = encodeUri(raw);
    } catch (e) {
      Toast({ message: `Encode error: ${e.message}`, type: 'error' });
    }
  }

  function doDecode() {
    const raw = encInput.value;
    if (!raw) {
      Toast({ message: 'No text to decode', type: 'warning' });
      return;
    }
    try {
      encOutput.textContent = decodeUri(raw);
    } catch (e) {
      Toast({ message: `Decode error: ${e.message}`, type: 'error' });
    }
  }

  encodeContent.append(
    encInput,
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-primary',
        textContent: 'Encode',
        onclick: doEncode,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-secondary',
        textContent: 'Decode',
        onclick: doDecode,
      }),
    ]),
    tag('label', { className: 'dtk-tool-label', textContent: 'Output' }),
    encOutput,
  );

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tabs,
    parseContent,
    encodeContent,
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'URL Parser', body });
  }
}

export { showUrlParser };
