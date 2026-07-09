import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid HEX color');
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function parseRgb(str) {
  const match = str.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (!match) throw new Error('Invalid RGB format');
  return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

function parseHsl(str) {
  const match = str.match(/hsl\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/i);
  if (!match) throw new Error('Invalid HSL format');
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function showColorConverter({ editor, settings, container }) {
  const input = tag('input', {
    className: 'dtk-tool-input',
    type: 'text',
    placeholder: 'Enter color (e.g. #ff00ff, rgb(255,0,255), hsl(300,100%,50%))',
  });

  const colorPreview = tag('div', {
    className: 'dtk-color-preview',
    style: 'width:100%;height:48px;border-radius:8px;margin:8px 0;',
  });

  const hexOutput = tag('pre', { className: 'dtk-tool-output dtk-tool-output-sm' });
  const rgbOutput = tag('pre', { className: 'dtk-tool-output dtk-tool-output-sm' });
  const hslOutput = tag('pre', { className: 'dtk-tool-output dtk-tool-output-sm' });

  function convert() {
    const raw = input.value.trim();
    if (!raw) {
      Toast({ message: 'Enter a color value', type: 'warning' });
      return;
    }
    try {
      let r, g, b;
      if (raw.startsWith('#')) {
        const rgb = hexToRgb(raw);
        r = rgb.r; g = rgb.g; b = rgb.b;
      } else if (raw.toLowerCase().startsWith('rgb')) {
        const rgb = parseRgb(raw);
        r = rgb.r; g = rgb.g; b = rgb.b;
      } else if (raw.toLowerCase().startsWith('hsl')) {
        const hsl = parseHsl(raw);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        r = Math.round(rgb.r); g = Math.round(rgb.g); b = Math.round(rgb.b);
      } else {
        Toast({ message: 'Unsupported color format. Use HEX, RGB, or HSL', type: 'error' });
        return;
      }
      const hex = rgbToHex(r, g, b);
      const hsl = rgbToHsl(r, g, b);

      hexOutput.textContent = hex;
      rgbOutput.textContent = `rgb(${r}, ${g}, ${b})`;
      hslOutput.textContent = `hsl(${hsl.h.toFixed(1)}, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%)`;
      colorPreview.style.background = hex;
    } catch (e) {
      hexOutput.textContent = '';
      rgbOutput.textContent = '';
      hslOutput.textContent = '';
      Toast({ message: `Conversion error: ${e.message}`, type: 'error' });
    }
  }

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'Color Input' }),
    input,
    tag('button', {
      className: 'dtk-btn dtk-btn-primary',
      textContent: 'Convert',
      onclick: convert,
      style: 'margin: 8px 0;',
    }),
    colorPreview,
    tag('label', { className: 'dtk-tool-label', textContent: 'HEX' }),
    hexOutput,
    tag('label', { className: 'dtk-tool-label', textContent: 'RGB' }),
    rgbOutput,
    tag('label', { className: 'dtk-tool-label', textContent: 'HSL' }),
    hslOutput,
  ]);

  input.onkeydown = (e) => { if (e.key === 'Enter') convert(); };

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'Color Converter', body });
  }
}

export { showColorConverter };
