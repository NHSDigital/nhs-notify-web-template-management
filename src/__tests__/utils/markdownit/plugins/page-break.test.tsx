import { PageBreak } from '@atoms/PageBreak/PageBreak';
import { MarkdownItWrapper } from '@utils/markdownit';
import { render } from '@testing-library/react';

describe('Page break plugin', () => {
  it('should overwrite *** directive and render as a custom HTML div', () => {
    const md = new MarkdownItWrapper().enablePageBreak();

    const actual = md.render('***');

    const expected = render(<PageBreak />).container.innerHTML;

    expect(actual).toBe(`<p>${expected}</p>\n`);
  });
});
