import { PageBreak } from '@/atoms/PageBreak/PageBreak';
import { MarkdownItWrapper } from '@/utils/markdownit';
import { render } from '@testing-library/react';

describe('Page break plugin', () => {
  it('should overwrite *** directive and render as a custom HTML div', () => {
    const md = new MarkdownItWrapper().enablePageBreak();

    const actual = md.render('***');

    const expected = render(<PageBreak />).container.innerHTML;

    expect(actual).toBe(expected);
  });

  it('should render --- as a <hr />', () => {
    const md = new MarkdownItWrapper().enablePageBreak();

    const actual = md.render('---');

    const expected = render(
      <>
        <hr />
        {'\n'}
      </>
    ).container.innerHTML;

    expect(actual).toBe(expected);
  });

  it('should not overwrite *** directive when not enabled', () => {
    const md = new MarkdownItWrapper().enable(['hr']);

    const actual = md.render('***');

    const expected = render(<hr />).container.innerHTML;
  });
});
