import { markdownList } from '@utils/markdown-list';

test('returns a markdown string for an ordered list', () => {
  expect(markdownList('ol', ['foo', 'bar', 'baz'])).toEqual(
    '1. foo\n2. bar\n3. baz'
  );
});

test('returns a markdown string for an unordered list', () => {
  expect(markdownList('ul', ['foo', 'bar', 'baz'])).toEqual(
    '- foo\n- bar\n- baz'
  );
});
