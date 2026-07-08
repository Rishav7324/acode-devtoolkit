import { describe, it, expect } from 'vitest';
import {
  minifyJS,
  minifyCSS,
  minifyHTML,
  formatJS,
  formatCSS,
  formatHTML,
} from '../../src/tools/minifier/ui.js';

describe('Minifier', () => {
  describe('minifyJS', () => {
    it('removes single-line comments', () => {
      const input = 'const x = 1; // comment\nconst y = 2;';
      expect(minifyJS(input)).not.toContain('comment');
    });

    it('removes multi-line comments', () => {
      const input = '/* block */ const x = 1;';
      expect(minifyJS(input)).not.toContain('block');
    });

    it('collapses whitespace', () => {
      const input = 'const   x   =   1;';
      const result = minifyJS(input);
      expect(result).toBe('const x = 1;');
    });

    it('removes whitespace around braces and parens', () => {
      const input = 'if (true) { return 1; }';
      const result = minifyJS(input);
      expect(result).not.toContain('( ');
      expect(result).not.toContain(' )');
      expect(result).not.toContain('{ ');
      expect(result).not.toContain(' }');
    });

    it('preserves essential code', () => {
      const input = 'function add(a, b) { return a + b; }';
      const result = minifyJS(input);
      expect(result).toContain('return');
      expect(result).toContain('a + b');
    });

    it('handles empty input', () => {
      expect(minifyJS('')).toBe('');
    });
  });

  describe('minifyCSS', () => {
    it('removes comments', () => {
      const input = '/* comment */ .foo { color: red; }';
      expect(minifyCSS(input)).not.toContain('comment');
    });

    it('collapses whitespace', () => {
      const input = '.foo   {   color:   red;   }';
      const result = minifyCSS(input);
      expect(result).toBe('.foo{color:red}');
    });

    it('removes trailing semicolons', () => {
      const input = '.foo { color: red; }';
      expect(minifyCSS(input)).toBe('.foo{color:red}');
    });

    it('handles empty input', () => {
      expect(minifyCSS('')).toBe('');
    });
  });

  describe('minifyHTML', () => {
    it('removes HTML comments', () => {
      const input = '<!-- comment --><div></div>';
      expect(minifyHTML(input)).not.toContain('comment');
    });

    it('removes whitespace between tags', () => {
      const input = '<div>  <span>text</span>  </div>';
      const result = minifyHTML(input);
      expect(result).toBe('<div><span>text</span></div>');
    });

    it('handles empty input', () => {
      expect(minifyHTML('')).toBe('');
    });
  });

  describe('formatJS', () => {
    it('adds indentation to blocks', () => {
      const input = 'function a(){return 1;}';
      const result = formatJS(input);
      expect(result).toContain('\n  ');
      expect(result).toContain('return 1;');
    });

    it('handles empty input', () => {
      expect(formatJS('')).toBe('');
    });
  });

  describe('formatCSS', () => {
    it('adds newlines and indentation', () => {
      const input = '.foo{color:red;background:blue;}';
      const result = formatCSS(input);
      expect(result).toContain('\n  ');
      expect(result).toContain('color: red');
    });
  });

  describe('formatHTML', () => {
    it('adds proper indentation', () => {
      const input = '<div><span>text</span></div>';
      const result = formatHTML(input);
      expect(result).toContain('\n');
    });
  });
});
