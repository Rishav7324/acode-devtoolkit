import { logger } from '../utils/logger.js';

let _announcer = null;

function getAnnouncer() {
  if (!_announcer) {
    _announcer = document.createElement('div');
    _announcer.setAttribute('role', 'status');
    _announcer.setAttribute('aria-live', 'polite');
    _announcer.setAttribute('aria-atomic', 'true');
    _announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(_announcer);
  }
  return _announcer;
}

export class Accessibility {
  constructor() {
    this._motionQuery = null;
    this._contrastQuery = null;
    this._reducedMotion = false;
    this._highContrast = false;

    if (typeof window !== 'undefined' && window.matchMedia) {
      this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._reducedMotion = this._motionQuery.matches;
      this._motionQuery.addEventListener('change', (e) => {
        this._reducedMotion = e.matches;
      });

      this._contrastQuery = window.matchMedia('(prefers-contrast: more)');
      this._highContrast = this._contrastQuery.matches;
      this._contrastQuery.addEventListener('change', (e) => {
        this._highContrast = e.matches;
      });
    }
  }

  setAriaLabel(el, label) {
    if (el) el.setAttribute('aria-label', label);
  }

  setRole(el, role) {
    if (el) el.setAttribute('role', role);
  }

  announce(message) {
    if (!message) return;
    const announcer = getAnnouncer();
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  }

  prefersReducedMotion() {
    return this._reducedMotion;
  }

  prefersHighContrast() {
    return this._highContrast;
  }

  setFocusTrap(container) {
    if (!container) return;

    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    this._focusHandler = handleKeyDown;
    this._focusContainer = container;
  }

  releaseFocusTrap() {
    if (this._focusContainer && this._focusHandler) {
      this._focusContainer.removeEventListener('keydown', this._focusHandler);
      this._focusContainer = null;
      this._focusHandler = null;
    }
  }

  destroy() {
    this.releaseFocusTrap();
    this._motionQuery = null;
    this._contrastQuery = null;
  }
}
