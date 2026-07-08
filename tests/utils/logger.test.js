import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../src/utils/logger.js';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('test info');
    expect(console.info).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('test warn');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('test error');
    expect(console.error).toHaveBeenCalled();
  });

  it('should log debug messages in development mode', () => {
    logger.setMode('DEVELOPMENT');
    logger.debug('test debug');
    expect(console.log).toHaveBeenCalled();
    logger.setMode('PRODUCTION');
  });

  it('should not log debug messages in production mode', () => {
    logger.setLevel('error');
    logger.debug('should not appear');
    expect(console.log).not.toHaveBeenCalled();
    logger.setLevel('info');
  });

  it('should change mode via setMode', () => {
    logger.setMode('SILENT');
    logger.info('silent test');
    expect(console.info).not.toHaveBeenCalled();
    logger.setMode('PRODUCTION');
  });

  it('should return the current mode', () => {
    logger.setMode('production');
    expect(logger.getMode()).toBe('PRODUCTION');
    logger.setMode('DEVELOPMENT');
    expect(logger.getMode()).toBe('DEVELOPMENT');
    logger.setMode('PRODUCTION');
  });

  it('should survive being called with no arguments', () => {
    expect(() => logger.info()).not.toThrow();
    expect(() => logger.warn()).not.toThrow();
    expect(() => logger.error()).not.toThrow();
    expect(() => logger.debug()).not.toThrow();
  });

  it('should support group and groupEnd', () => {
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    logger.group('test-group');
    expect(console.group).toHaveBeenCalledWith('test-group');
    logger.groupEnd();
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('should set level correctly', () => {
    logger.setLevel('error');
    logger.info('should not appear');
    expect(console.info).not.toHaveBeenCalled();
    logger.warn('should not appear');
    expect(console.warn).not.toHaveBeenCalled();
    logger.error('should appear');
    expect(console.error).toHaveBeenCalled();
    logger.setLevel('info');
  });
});
