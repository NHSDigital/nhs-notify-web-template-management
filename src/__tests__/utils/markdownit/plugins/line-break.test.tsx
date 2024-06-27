import { MarkdownItWrapper } from '@/utils/markdownit';
import { render } from '@testing-library/react';

describe('Page break plugin', () => {
  it('should create a line break when double is used', () => {
    const md = new MarkdownItWrapper().enableLineBreak();

    const actual = md.render('hello  new line');

    const expected = render(
      <>
        <p>
          hello
          <br />
          new line
        </p>
        {'\n'}
      </>
    ).container.innerHTML;

    expect(actual).toBe(expected);
  });

  it('should not create a line break when line break is not enabled', () => {
    const md = new MarkdownItWrapper();

    const actual = md.render('hello  not a new line');

    const expected = render(
      <>
        <p>hello{'  '}not a new line</p>
        {'\n'}
      </>
    ).container.innerHTML;

    expect(actual).toBe(expected);
  });
});
