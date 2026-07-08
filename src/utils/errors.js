export class ModuleError extends Error {
  constructor(moduleId, message, cause = null) {
    super(`[${moduleId}] ${message}`);
    this.name = 'ModuleError';
    this.moduleId = moduleId;
    this.cause = cause;
  }
}

export class DependencyError extends ModuleError {
  constructor(moduleId, dependencyId, message) {
    super(moduleId, `Dependency "${dependencyId}": ${message}`);
    this.name = 'DependencyError';
    this.dependencyId = dependencyId;
  }
}

export class CircularDependencyError extends DependencyError {
  constructor(moduleId, dependencyId, chain) {
    super(moduleId, dependencyId, `Circular dependency detected: ${chain.join(' -> ')}`);
    this.name = 'CircularDependencyError';
    this.chain = chain;
  }
}

export class ValidationError extends ModuleError {
  constructor(moduleId, field, reason) {
    super(moduleId, `Validation failed for "${field}": ${reason}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class LifecycleError extends ModuleError {
  constructor(moduleId, fromState, toState, cause = null) {
    super(moduleId, `Cannot transition from "${fromState}" to "${toState}"`, cause);
    this.name = 'LifecycleError';
    this.fromState = fromState;
    this.toState = toState;
  }
}
