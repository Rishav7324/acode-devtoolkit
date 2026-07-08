import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';

const REQUIRED_FIELDS = ['id', 'version', 'startup'];
const OPTIONAL_FIELDS = {
  name: '',
  description: '',
  author: '',
  category: 'developer',
  icon: '\u2699',
  permissions: [],
  dependencies: { required: [], optional: [] },
  commands: [],
  settings: [],
  searchEntries: [],
  actions: [],
  shutdown: null,
  cleanup: null,
};

export class ModuleLoader {
  load(descriptor) {
    const errors = this.validate(descriptor);
    if (errors.length > 0) {
      logger.error(`ModuleLoader: validation failed for "${descriptor.id || 'unknown'}"`);
      for (const err of errors) {
        logger.error(`  - ${err.message}`);
      }
      return null;
    }

    const module = this._applyDefaults(descriptor);
    logger.debug(`ModuleLoader: loaded "${module.id}" v${module.version}`);
    return module;
  }

  validate(descriptor) {
    const errors = [];

    if (!descriptor || typeof descriptor !== 'object') {
      errors.push(new ValidationError('?', 'descriptor', 'Module descriptor must be an object'));
      return errors;
    }

    const id = descriptor.id || '?';

    for (const field of REQUIRED_FIELDS) {
      if (!(field in descriptor)) {
        errors.push(new ValidationError(id, field, 'Field is required'));
      }
    }

    if (descriptor.id !== undefined && (typeof descriptor.id !== 'string' || !descriptor.id.trim())) {
      errors.push(new ValidationError(id, 'id', 'Must be a non-empty string'));
    }

    if (descriptor.version !== undefined && typeof descriptor.version !== 'string') {
      errors.push(new ValidationError(id, 'version', 'Must be a string (e.g. "1.0.0")'));
    }

    if (descriptor.startup !== undefined && typeof descriptor.startup !== 'function') {
      errors.push(new ValidationError(id, 'startup', 'Must be a function'));
    }

    if (descriptor.shutdown !== undefined && descriptor.shutdown !== null && typeof descriptor.shutdown !== 'function') {
      errors.push(new ValidationError(id, 'shutdown', 'Must be a function or null'));
    }

    if (descriptor.commands !== undefined && !Array.isArray(descriptor.commands)) {
      errors.push(new ValidationError(id, 'commands', 'Must be an array'));
    }

    if (descriptor.dependencies !== undefined) {
      if (typeof descriptor.dependencies !== 'object') {
        errors.push(new ValidationError(id, 'dependencies', 'Must be an object with optional "required" and "optional" arrays'));
      } else {
        if (descriptor.dependencies.required && !Array.isArray(descriptor.dependencies.required)) {
          errors.push(new ValidationError(id, 'dependencies.required', 'Must be an array'));
        }
        if (descriptor.dependencies.optional && !Array.isArray(descriptor.dependencies.optional)) {
          errors.push(new ValidationError(id, 'dependencies.optional', 'Must be an array'));
        }
      }
    }

    return errors;
  }

  _applyDefaults(descriptor) {
    const result = { ...descriptor };

    for (const [key, defaultValue] of Object.entries(OPTIONAL_FIELDS)) {
      if (!(key in result)) {
        result[key] = defaultValue;
      }
    }

    if (!result.dependencies) {
      result.dependencies = { required: [], optional: [] };
    }
    if (!result.dependencies.required) result.dependencies.required = [];
    if (!result.dependencies.optional) result.dependencies.optional = [];

    return result;
  }

  validateAll(descriptors) {
    const loaded = [];
    const failed = [];

    for (const desc of descriptors) {
      const module = this.load(desc);
      if (module) {
        loaded.push(module);
      } else {
        failed.push(desc.id || 'unknown');
      }
    }

    return { loaded, failed };
  }
}
