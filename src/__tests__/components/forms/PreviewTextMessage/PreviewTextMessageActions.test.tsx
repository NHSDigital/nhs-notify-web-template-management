import { mockDeep } from 'jest-mock-extended';
import { PreviewTextMessageActions } from '@forms/PreviewTextMessage';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';

describe('PreviewTextMessageActions', () => {
  it('should enable text message markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    new PreviewTextMessageActions({
      markdownClient: markdownItWrapperMock,
    });

    expect(markdownItWrapperMock.enableLineBreak).not.toHaveBeenCalled();

    expect(markdownItWrapperMock.enable).not.toHaveBeenCalled();
  });

  it('should only process text message markdown rules', () => {
    const actions = new PreviewTextMessageActions();

    const html = actions.renderMarkdown(markdown);

    expect(html).toMatchSnapshot();
  });
});
