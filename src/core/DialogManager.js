import { logger } from '../utils/logger.js';

export class DialogManager {
  constructor(accessibility) {
    this._accessibility = accessibility;
    this._stack = [];
  }

  show(component, options = {}) {
    const dialog = {
      id: options.id || `dialog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      component,
      options,
      createdAt: Date.now(),
      dismissable: options.dismissable !== false,
    };

    this._stack.push(dialog);

    if (this._accessibility) {
      this._accessibility.setFocusTrap(component);
      this._accessibility.announce(options.title || 'Dialog opened');
    }

    return dialog;
  }

  dismiss(id) {
    if (id) {
      const idx = this._stack.findIndex((d) => d.id === id);
      if (idx !== -1) {
        this._stack.splice(idx, 1);
        this._restoreFocus();
        return;
      }
    }

    if (this._stack.length > 0) {
      this._stack.pop();
      this._restoreFocus();
    }
  }

  dismissAll() {
    this._stack = [];
  }

  get top() {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
  }

  get count() {
    return this._stack.length;
  }

  get stack() {
    return [...this._stack];
  }

  _restoreFocus() {
    if (this._stack.length > 0 && this._accessibility) {
      const current = this._stack[this._stack.length - 1];
      this._accessibility.setFocusTrap(current.component);
    }
  }

  destroy() {
    this.dismissAll();
    this._accessibility = null;
  }
}
