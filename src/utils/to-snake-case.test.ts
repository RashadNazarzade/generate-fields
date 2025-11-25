import { test, expect, describe } from 'vitest';
import { toSnakeCase } from './to-snake-case.js';

describe('toSnakeCase', () => {
  test('should convert camelCase to snake_case', () => {
    expect(toSnakeCase('camelCase')).toBe('camel_case');
  });

  test('should convert PascalCase to snake_case', () => {
    expect(toSnakeCase('PascalCase')).toBe('pascal_case');
  });

  test('should convert snake_case to snake_case', () => {
    expect(toSnakeCase('snake_case')).toBe('snake_case');
  });
});
