import { MarkdownItWrapper } from '@utils/markdownit';
import { lineBreak, pageBreak } from '@utils/markdownit/plugins';

jest.mock('@utils/markdownit/plugins');

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
