import { mockDeep } from 'jest-mock-extended';
import { PreviewLetterActions } from '@forms/PreviewLetter';
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

    new PreviewLetterActions({
      markdownClient: markdownItWrapperMock,
    });

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enablePageBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'list',
      'hr',
      'emphasis',
    ]);
  });

  it('should only process letter markdown rules', () => {
    const actions = new PreviewLetterActions();

    const html = actions.renderMarkdown(markdown);

    expect(html).toMatchSnapshot();
  });
});
