import { MarkdownItWrapper } from '@utils/markdownit';
import { lineBreak } from '@utils/markdownit/plugins/line-break';
import { pageBreak } from '@utils/markdownit/plugins/page-break';

jest.mock('@utils/markdownit/plugins/line-break');
jest.mock('@utils/markdownit/plugins/page-break');

const pageBreakMock = jest.mocked(pageBreak);
const lineBreakMock = jest.mocked(lineBreak);

describe('MarkdownItWrapper', () => {
  beforeEach(jest.resetAllMocks);

  it('should use page breaks when option is enabled', () => {
    new MarkdownItWrapper().enablePageBreak();

    expect(pageBreakMock).toHaveBeenCalled();
  });

  it('should enable line breaks when option is enabled', () => {
    new MarkdownItWrapper().enableLineBreak();

    expect(lineBreakMock).toHaveBeenCalled();
  });
});
