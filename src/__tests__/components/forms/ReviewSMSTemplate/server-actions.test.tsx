import { mockDeep } from 'jest-mock-extended';
import { renderMarkdown } from '@forms/ReviewSMSTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';

describe('PreviewTextMessageActions', () => {
  it('should enable text message markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderMarkdown('message', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).not.toHaveBeenCalled();

    expect(markdownItWrapperMock.enable).not.toHaveBeenCalled();
  });

  it('should only process text message markdown rules', () => {
    expect(renderMarkdown(markdown)).toMatchSnapshot();
  });
});
