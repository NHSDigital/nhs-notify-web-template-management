import { truncate } from '@utils/truncate';

test('returns empty string for empty input', () => {
  expect(truncate('')).toBe('');
});

test('returns full string if under max length', () => {
  expect(truncate('Hello', 10)).toBe('Hello');
});

test('truncates and adds ellipsis if over max length', () => {
  expect(truncate('This is a long string', 10)).toBe('This is a…');
});

it('trims trailing whitespace before ellipsis', () => {
  expect(truncate('Hello world', 6)).toBe('Hello…');
});
