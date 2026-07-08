export function safeHtml(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (ch) => map[ch]);
}

export function setTextContent(el, text) {
  el.textContent = text != null ? String(text) : '';
  return el;
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = val;
    } else if (key === 'textContent') {
      setTextContent(el, val);
    } else if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (val !== undefined && val !== null) {
      el.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (child) el.append(child);
  }
  return el;
}
