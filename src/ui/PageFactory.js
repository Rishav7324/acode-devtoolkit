import { logger } from '../utils/logger.js';

export class PageFactory {
  create(title, options = {}) {
    try {
      const page = acode.require('page');
      const instance = page(title, {
        lead: options.lead || null,
        tail: options.tail || null,
      });

      return instance;
    } catch (error) {
      logger.error('Failed to create page:', error);
      return null;
    }
  }

  pushToStack(page, id) {
    try {
      const actionStack = acode.require('actionStack');
      actionStack.push({
        id: id || `page-${Date.now()}`,
        action: () => page.hide(),
      });
    } catch (error) {
      logger.error('Failed to push to action stack:', error);
    }
  }

  popFromStack(id) {
    try {
      const actionStack = acode.require('actionStack');
      actionStack.remove(id);
    } catch (error) {
      logger.error('Failed to remove from action stack:', error);
    }
  }

  show(page, stackId) {
    if (!page) return;

    try {
      const app = document.getElementById('app');
      if (app) {
        app.append(page);
      }
      this.pushToStack(page, stackId);
    } catch (error) {
      logger.error('Failed to show page:', error);
    }
  }

  hide(page) {
    if (!page) return;
    try {
      page.hide();
    } catch (error) {
      logger.error('Failed to hide page:', error);
    }
  }
}
