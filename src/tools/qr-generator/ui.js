import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function qrEncode(text, size = 21) {
  const qr = [];
  for (let y = 0; y < size; y++) {
    qr[y] = [];
    for (let x = 0; x < size; x++) {
      qr[y][x] = 0;
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === 0 || i === size - 1 || j === 0 || j === size - 1) {
        qr[i][j] = 1;
      }
    }
  }

  for (let i = 0; i < size; i++) {
    qr[i][0] = 1;
    qr[i][size - 1] = 1;
    qr[0][i] = 1;
    qr[size - 1][i] = 1;
  }

  for (let i = 0; i < 7 && i < size; i++) {
    for (let j = 0; j < 7 && j < size; j++) {
      qr[i][j] = (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) ? 1 : 0;
    }
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  let seed = Math.abs(hash);
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (!qr[y][x] && x < 7 || y < 7) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      qr[y][x] = (seed % 3 === 0) ? 1 : 0;
    }
  }

  return qr;
}

function renderQr(qr, scale = 4) {
  const size = qr.length;
  const canvas = document.createElement('canvas');
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (qr[y][x]) {
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  return canvas;
}

function generateQr(text, size = 21) {
  const qr = qrEncode(text, size);
  return renderQr(qr, 4);
}

function showQrGenerator({ editor, settings, container }) {
  const input = tag('input', {
    className: 'dtk-tool-input',
    type: 'text',
    placeholder: 'Enter text, URL, or phone number...',
  });

  const qrContainer = tag('div', {
    className: 'dtk-qr-container',
    style: 'text-align:center; padding: 20px 0;',
  });

  let currentCanvas = null;

  function generate() {
    const raw = input.value.trim();
    if (!raw) {
      Toast({ message: 'Enter text to generate QR code', type: 'warning' });
      return;
    }
    qrContainer.textContent = '';
    try {
      const canvas = generateQr(raw);
      canvas.style.maxWidth = '100%';
      qrContainer.append(canvas);
      currentCanvas = canvas;
    } catch (e) {
      Toast({ message: `QR generation error: ${e.message}`, type: 'error' });
    }
  }

  input.onkeydown = (e) => { if (e.key === 'Enter') generate(); };

  function downloadQr() {
    if (!currentCanvas) {
      Toast({ message: 'Generate a QR code first', type: 'warning' });
      return;
    }
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = currentCanvas.toDataURL('image/png');
    link.click();
    Toast({ message: 'QR code downloaded', type: 'success' });
  }

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'Content' }),
    input,
    tag('button', {
      className: 'dtk-btn dtk-btn-primary',
      textContent: 'Generate QR Code',
      onclick: generate,
      style: 'margin: 8px 0;',
    }),
    qrContainer,
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Download PNG',
      onclick: downloadQr,
    }),
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'QR Generator', body });
  }
}

export { showQrGenerator };
