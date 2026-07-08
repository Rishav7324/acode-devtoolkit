import { logger } from '../utils/logger.js';

export class Observability {
  constructor() {
    this._marks = new Map();
    this._counters = new Map();
    this._gauges = new Map();
    this._measures = [];
  }

  mark(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
    this._marks.set(name, Date.now());
  }

  measure(name, startMark, endMark) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
      }
    }

    const start = this._marks.get(startMark) || 0;
    const end = this._marks.get(endMark) || Date.now();
    const duration = end - start;

    this._measures.push({ name, startMark, endMark, duration, timestamp: Date.now() });

    if (this._measures.length > 1000) {
      this._measures.splice(0, this._measures.length - 1000);
    }

    return duration;
  }

  increment(counter, value = 1) {
    this._counters.set(counter, (this._counters.get(counter) || 0) + value);
  }

  gauge(name, value) {
    this._gauges.set(name, { value, timestamp: Date.now() });
  }

  getCounter(name) {
    return this._counters.get(name) || 0;
  }

  getGauge(name) {
    const g = this._gauges.get(name);
    return g ? g.value : null;
  }

  report() {
    return {
      counters: Object.fromEntries(this._counters),
      gauges: Object.fromEntries(
        Array.from(this._gauges.entries()).map(([k, v]) => [k, v.value])
      ),
      measures: this._measures.slice(-50),
      marks: Object.fromEntries(this._marks),
    };
  }

  time(fn, label = 'anonymous') {
    const start = performance.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          this._measures.push({ name: label, duration, timestamp: Date.now() });
        });
      }
      const duration = performance.now() - start;
      this._measures.push({ name: label, duration, timestamp: Date.now() });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this._measures.push({ name: label, duration, timestamp: Date.now(), error: true });
      throw error;
    }
  }

  async timeAsync(fn, label = 'anonymous') {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this._measures.push({ name: label, duration, timestamp: Date.now() });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this._measures.push({ name: label, duration, timestamp: Date.now(), error: true });
      throw error;
    }
  }

  reset() {
    this._marks.clear();
    this._counters.clear();
    this._gauges.clear();
    this._measures = [];
  }
}
