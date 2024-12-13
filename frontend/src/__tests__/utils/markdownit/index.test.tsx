import { MarkdownItWrapper } from '@utils/markdownit';
import { lineBreak } from '@utils/markdownit/plugins/line-break';

jest.mock('@utils/markdownit/plugins/line-break');

const lineBreakMock = jest.mocked(lineBreak);

describe('MarkdownItWrapper', () => {
  beforeEach(jest.resetAllMocks);

  it('should enable line breaks when option is enabled', () => {
    new MarkdownItWrapper().enableLineBreak();

    expect(lineBreakMock).toHaveBeenCalled();
  });
});
