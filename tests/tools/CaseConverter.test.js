import { describe, it, expect } from 'vitest';
import { toWords, convertCase } from '../../src/tools/case-converter/ui.js';

describe('CaseConverter', () => {
  describe('toWords', () => {
    it('splits camelCase', () => {
      expect(toWords('camelCase')).toEqual(['camel', 'Case']);
    });

    it('splits PascalCase', () => {
      expect(toWords('PascalCase')).toEqual(['Pascal', 'Case']);
    });

    it('splits snake_case', () => {
      expect(toWords('snake_case')).toEqual(['snake', 'case']);
    });

    it('splits kebab-case', () => {
      expect(toWords('kebab-case')).toEqual(['kebab', 'case']);
    });

    it('splits space-separated', () => {
      expect(toWords('hello world')).toEqual(['hello', 'world']);
    });

    it('handles mixed separators', () => {
      expect(toWords('hello_world-test Case')).toEqual(['hello', 'world', 'test', 'Case']);
    });

    it('returns empty array for empty string', () => {
      expect(toWords('')).toEqual([]);
    });

    it('returns empty array for only separators', () => {
      expect(toWords('-_ ')).toEqual([]);
    });
  });

  describe('convertCase', () => {
    const input = 'hello world';

    it('converts to camelCase', () => {
      expect(convertCase(input, 'camel')).toBe('helloWorld');
    });

    it('converts to PascalCase', () => {
      expect(convertCase(input, 'pascal')).toBe('HelloWorld');
    });

    it('converts to snake_case', () => {
      expect(convertCase(input, 'snake')).toBe('hello_world');
    });

    it('converts to kebab-case', () => {
      expect(convertCase(input, 'kebab')).toBe('hello-world');
    });

    it('converts to UPPER CASE', () => {
      expect(convertCase(input, 'upper')).toBe('HELLO WORLD');
    });

    it('converts to lower case', () => {
      expect(convertCase(input, 'lower')).toBe('hello world');
    });

    it('converts to Title Case', () => {
      expect(convertCase(input, 'title')).toBe('Hello World');
    });

    it('converts to CONSTANT_CASE', () => {
      expect(convertCase(input, 'constant')).toBe('HELLO_WORLD');
    });

    it('converts to dot.case', () => {
      expect(convertCase(input, 'dot')).toBe('hello.world');
    });

    it('converts to path/case', () => {
      expect(convertCase(input, 'path')).toBe('hello/world');
    });

    it('returns empty string for empty input', () => {
      expect(convertCase('', 'camel')).toBe('');
    });

    it('handles single word input', () => {
      expect(convertCase('hello', 'camel')).toBe('hello');
      expect(convertCase('hello', 'pascal')).toBe('Hello');
      expect(convertCase('hello', 'upper')).toBe('HELLO');
    });
  });
});
