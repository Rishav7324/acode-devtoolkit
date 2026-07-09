import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function generatePassword(length, useUpper, useLower, useDigits, useSymbols) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useDigits) chars += digits;
  if (useSymbols) chars += symbols;

  if (!chars) throw new Error('Select at least one character type');

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

function strengthLabel(length, types) {
  const score = length * types;
  if (score < 16) return { label: 'Weak', cls: 'strength-weak' };
  if (score < 32) return { label: 'Moderate', cls: 'strength-moderate' };
  if (score < 48) return { label: 'Strong', cls: 'strength-strong' };
  return { label: 'Very Strong', cls: 'strength-very-strong' };
}

function showPasswordGen({ editor, settings, container }) {
  const lengthSlider = tag('input', {
    className: 'dtk-tool-slider',
    type: 'range',
    min: '4',
    max: '64',
    value: '16',
  });

  const lengthLabel = tag('span', {
    className: 'dtk-tool-slider-label',
    textContent: '16',
  });

  const upperCheck = tag('input', { type: 'checkbox', checked: 'true' });
  const lowerCheck = tag('input', { type: 'checkbox', checked: 'true' });
  const digitsCheck = tag('input', { type: 'checkbox', checked: 'true' });
  const symbolsCheck = tag('input', { type: 'checkbox' });

  const strengthBar = tag('div', { className: 'dtk-strength-bar' });

  const output = tag('pre', { className: 'dtk-tool-output' });

  function generate() {
    const len = parseInt(lengthSlider.value, 10);
    const useUpper = upperCheck.checked;
    const useLower = lowerCheck.checked;
    const useDigits = digitsCheck.checked;
    const useSymbols = symbolsCheck.checked;
    const types = [useUpper, useLower, useDigits, useSymbols].filter(Boolean).length;

    try {
      const pwd = generatePassword(len, useUpper, useLower, useDigits, useSymbols);
      output.textContent = pwd;
      const strength = strengthLabel(len, types);
      strengthBar.textContent = strength.label;
      strengthBar.className = 'dtk-strength-bar ' + strength.cls;
    } catch (e) {
      strengthBar.textContent = '';
      Toast({ message: e.message, type: 'warning' });
    }
  }

  lengthSlider.oninput = () => {
    lengthLabel.textContent = lengthSlider.value;
  };

  [upperCheck, lowerCheck, digitsCheck, symbolsCheck].forEach(cb => {
    cb.onchange = generate;
  });

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

  generate();

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'Password Length' }),
    tag('div', { className: 'dtk-tool-slider-group' }, [lengthSlider, lengthLabel]),
    tag('label', { className: 'dtk-tool-label', textContent: 'Character Types' }),
    tag('div', { className: 'dtk-tool-checkbox-group' }, [
      tag('label', { className: 'dtk-tool-checkbox' }, [upperCheck, ' A-Z']),
      tag('label', { className: 'dtk-tool-checkbox' }, [lowerCheck, ' a-z']),
      tag('label', { className: 'dtk-tool-checkbox' }, [digitsCheck, ' 0-9']),
      tag('label', { className: 'dtk-tool-checkbox' }, [symbolsCheck, ' !@#$%']),
    ]),
    strengthBar,
    tag('label', { className: 'dtk-tool-label', textContent: 'Generated Password' }),
    output,
    tag('button', {
      className: 'dtk-btn dtk-btn-primary',
      textContent: 'Generate',
      onclick: generate,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Copy to Clipboard',
      onclick: copyOutput,
      style: 'margin-left: 8px;',
    }),
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'Password Generator', body });
  }
}

export { showPasswordGen };
