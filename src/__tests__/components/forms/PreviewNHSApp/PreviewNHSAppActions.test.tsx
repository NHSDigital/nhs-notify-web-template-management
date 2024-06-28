import { mockDeep } from 'jest-mock-extended';
import { PreviewNHSAppActions } from '@forms/PreviewNHSApp';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';

describe('PreviewNHSAppActions', () => {
  it('should enable letter markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    new PreviewNHSAppActions({
      markdownClient: markdownItWrapperMock,
    });

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'link',
      'list',
      'emphasis',
    ]);
  });

  it('should only process letter markdown rules', () => {
    const actions = new PreviewNHSAppActions();

    const html = actions.renderMarkdown(markdown);

    expect(html).toMatchSnapshot();
  });
});
