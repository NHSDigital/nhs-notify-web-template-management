import { truncate } from '@utils/truncate';

test('returns empty string for empty input', () => {
  expect(truncate('')).toBe('');
});

test('returns full string if under max length', () => {
  expect(truncate('Hello', 10)).toBe('Hello');
});

test('returns original text when exactly max length', () => {
  expect(truncate('Hello', 5)).toBe('Hello');
});

test('truncates and adds ellipsis if over max length', () => {
  expect(truncate('This is a long string', 10)).toBe('This is a…');
});

test('removes space before ellipsis after truncation', () => {
  expect(truncate('Hello world', 6)).toBe('Hello…');
});

test('ignores trailing whitespace when under max length', () => {
  expect(truncate('Hello     ', 5)).toBe('Hello');
});

test('does not truncate if string length equals max length after trimming', () => {
  expect(truncate('Hello     ', 5)).toBe('Hello');
});

test('truncates and removes trailing whitespace before ellipsis', () => {
  expect(truncate('This is a test     ', 10)).toBe('This is a…');
});
