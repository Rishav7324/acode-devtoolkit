import { logger } from '../utils/logger.js';

export class NotificationService {
  show(title, message, options = {}) {
    try {
      if (window.acode && window.acode.pushNotification) {
        window.acode.pushNotification(title, message, {
          type: options.type || 'info',
          ...options,
        });
      }
    } catch (error) {
      logger.error('Failed to show notification:', error);
    }
  }

  info(title, message, options = {}) {
    this.show(title, message, { ...options, type: 'info' });
  }

  success(title, message, options = {}) {
    this.show(title, message, { ...options, type: 'success' });
  }

  warning(title, message, options = {}) {
    this.show(title, message, { ...options, type: 'warning' });
  }

  error(title, message, options = {}) {
    this.show(title, message, { ...options, type: 'error' });
  }
}
