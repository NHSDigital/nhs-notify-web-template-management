import { toKebabCase } from '@utils/kebab-case';

describe('toKebabCase', () => {
  it('returns empty string for empty input', () => {
    expect(toKebabCase('')).toBe('');
  });

  it('returns empty string for only symbols', () => {
    expect(toKebabCase('!!!')).toBe('');
  });

  it('converts spaces to hyphens', () => {
    expect(toKebabCase('this is a test')).toBe('this-is-a-test');
  });

  it('removes leading and trailing non-alphanumeric characters', () => {
    expect(toKebabCase('  Hello World! ')).toBe('hello-world');
  });

  it('converts underscores and special characters to hyphens', () => {
    expect(toKebabCase('some_text_with@symbols')).toBe(
      'some-text-with-symbols'
    );
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(toKebabCase('one--two___three!!')).toBe('one-two-three');
  });

  it('handles numeric characters correctly', () => {
    expect(toKebabCase('Version 2.0.1')).toBe('version-2-0-1');
  });

  it('handles mixed case input', () => {
    expect(toKebabCase('MyMixedCASEInput')).toBe('mymixedcaseinput');
  });

  it('preserves valid alphanumeric strings without change except lowercase', () => {
    expect(toKebabCase('Already-Kebab-Case123')).toBe('already-kebab-case123');
  });
});
