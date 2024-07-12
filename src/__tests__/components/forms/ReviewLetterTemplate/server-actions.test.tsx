import { mockDeep } from 'jest-mock-extended';
import { renderMarkdown } from '@/src/components/forms/ReviewLetterTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';

describe('PreviewLetterActions', () => {
  it('should enable letter markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    markdownItWrapperMock.enablePageBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderMarkdown('message', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enablePageBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'list',
      'emphasis',
    ]);
  });

  it('should only process letter markdown rules', () => {
    expect(renderMarkdown(markdown)).toMatchSnapshot();
  });
});
