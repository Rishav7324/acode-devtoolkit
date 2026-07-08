import { logger } from '../utils/logger.js';

const STATE = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export class JobManager {
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._jobs = new Map();
    this._queue = [];
  }

  schedule(name, fn, options = {}) {
    if (this._jobs.has(name)) {
      logger.warn(`JobManager: job "${name}" already exists, overwriting`);
    }

    const job = {
      name,
      state: STATE.PENDING,
      progress: 0,
      result: null,
      error: null,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      retries: 0,
      maxRetries: options.retries || 0,
      timeout: options.timeout || 0,
      cancelToken: null,
    };

    this._jobs.set(name, job);
    this._emit('job:scheduled', { name });

    const runner = async () => {
      job.state = STATE.RUNNING;
      job.startedAt = Date.now();
      job.cancelToken = { cancelled: false };
      this._emit('job:started', { name });

      let timer = null;
      if (job.timeout > 0) {
        timer = setTimeout(() => {
          job.cancelToken.cancelled = true;
          this._fail(job, new Error(`Job "${name}" timed out after ${job.timeout}ms`));
        }, job.timeout);
      }

      try {
        while (job.retries <= job.maxRetries) {
          if (job.cancelToken.cancelled) break;

          try {
            const result = await fn({
              progress: (pct) => {
                job.progress = pct;
                this._emit('job:progress', { name, progress: pct });
              },
              signal: job.cancelToken,
            });

            if (job.cancelToken.cancelled) {
              this._cancel(job);
            } else {
              job.result = result;
              job.state = STATE.COMPLETED;
              job.completedAt = Date.now();
              this._emit('job:completed', { name, result });
            }
            break;
          } catch (error) {
            job.retries++;
            if (job.retries > job.maxRetries) {
              this._fail(job, error);
              break;
            }
            logger.warn(`JobManager: job "${name}" failed (attempt ${job.retries}/${job.maxRetries + 1}), retrying...`);
            this._emit('job:retry', { name, attempt: job.retries, error });
          }
        }
      } finally {
        if (timer) clearTimeout(timer);
        this._processQueue();
      }
    };

    if (options.delay) {
      setTimeout(runner, options.delay);
    } else {
      runner();
    }

    return job;
  }

  cancel(name) {
    const job = this._jobs.get(name);
    if (!job || job.state === STATE.COMPLETED || job.state === STATE.CANCELLED) return;

    if (job.cancelToken) {
      job.cancelToken.cancelled = true;
    }
    this._cancel(job);
  }

  cancelAll() {
    for (const [name] of this._jobs) {
      this.cancel(name);
    }
    this._queue = [];
  }

  _cancel(job) {
    job.state = STATE.CANCELLED;
    job.completedAt = Date.now();
    this._emit('job:cancelled', { name: job.name });
  }

  _fail(job, error) {
    job.state = STATE.FAILED;
    job.error = error;
    job.completedAt = Date.now();
    this._emit('job:failed', { name: job.name, error });
    logger.error(`JobManager: job "${job.name}" failed:`, error);
  }

  _processQueue() {
    this._cleanup();
  }

  _cleanup() {
    const old = Date.now() - 300000;
    for (const [name, job] of this._jobs) {
      if (job.completedAt && job.completedAt < old) {
        this._jobs.delete(name);
      }
    }
  }

  getStatus(name) {
    const job = this._jobs.get(name);
    if (!job) return null;
    return {
      name: job.name,
      state: job.state,
      progress: job.progress,
      retries: job.retries,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
    };
  }

  list() {
    return Array.from(this._jobs.values()).map((j) => ({
      name: j.name,
      state: j.state,
      progress: j.progress,
    }));
  }

  _emit(event, data) {
    if (this._eventBus) {
      this._eventBus.emit(event, data);
    }
  }

  destroy() {
    this.cancelAll();
    this._jobs.clear();
    this._queue = [];
    this._eventBus = null;
  }
}
