import { vi } from 'vitest';

vi.mock('html-tag-js', () => {
  function tag(name, attrs, children) {
    if (typeof name === 'function') return name(attrs, children);
    const el = { tagName: name, ...attrs, children: children || [] };
    el.querySelector = (sel) => null;
    el.querySelectorAll = (sel) => [];
    el.appendChild = (c) => { el.children.push(c); };
    el.remove = () => {};
    el.dispatchEvent = (e) => {};
    el.addEventListener = (evt, fn) => {};
    el.setAttribute = (k, v) => {};
    el.focus = () => {};
    el.click = () => {};
    el.append = (...items) => { el.children.push(...items); };
    return el;
  }
  tag.text = (t) => ({ textContent: t, nodeType: 3 });
  tag.get = (s) => null;
  tag.getAll = (s) => [];
  return { default: tag };
});
