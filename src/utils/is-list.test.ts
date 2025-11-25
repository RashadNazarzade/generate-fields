import { test, expect, describe } from 'vitest';
import { isListed } from './is-list.js';

describe('isListed', () => {
  test('should return true if the path is listed', () => {
    const path = 'users.#.name';
    expect(isListed(path)).toBe(true);
  });

  test('should return false if the path is not listed', () => {
    const path = 'users.name';
    expect(isListed(path)).toBe(false);
  });
});
