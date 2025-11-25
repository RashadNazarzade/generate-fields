import { test, expect, describe } from 'vitest';
import { createIndexFormatter } from './create-index-formatter.js';

describe('createIndexFormatter', () => {
  test('should throw an error if the formatter is not called with the correct number of arguments', () => {
    const formatter = createIndexFormatter('users.#.name');
    expect(() => formatter(0, 1)).toThrow(
      'Formatter Mismatch: Template requires 1 arguments, but received 2.',
    );
  });

  test('should create an index formatter', () => {
    const formatter = createIndexFormatter('users.#.name');
    expect(formatter(0)).toBe('users.0.name');
  });

  test('should create an index formatter with multiple arguments', () => {
    const formatter = createIndexFormatter('users.#.id.#.name');
    expect(formatter(0, 1)).toBe('users.0.id.1.name');
  });
});
