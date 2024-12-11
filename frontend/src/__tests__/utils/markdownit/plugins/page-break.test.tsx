import { PageBreak } from '@atoms/PageBreak/PageBreak';
import { MarkdownItWrapper } from '@utils/markdownit';
import { render } from '@testing-library/react';

describe('Page break plugin', () => {
  it('should create a page break element when enabled and using ***', () => {
    const md = new MarkdownItWrapper().enablePageBreak();

    const actual = md.render('***');

    const expected = render(<PageBreak />).container.innerHTML;

    expect(actual).toBe(`<p>${expected}</p>\n`);
  });

  it('should render as *** when not enabled', () => {
    const md = new MarkdownItWrapper();

    const actual = md.render('***');

    const expected = render('***').container.innerHTML;

    expect(actual).toBe(`<p>${expected}</p>\n`);
  });
});
