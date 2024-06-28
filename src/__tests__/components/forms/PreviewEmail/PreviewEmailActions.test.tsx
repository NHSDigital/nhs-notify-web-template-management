import { mockDeep } from 'jest-mock-extended';
import { PreviewEmailActions } from '@forms/PreviewEmail';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';

describe('PreviewEmailActions', () => {
  it('should enable email markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    new PreviewEmailActions({
      markdownClient: markdownItWrapperMock,
    });

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'link',
      'list',
      'hr',
    ]);
  });

  it('should only process email markdown rules', () => {
    const actions = new PreviewEmailActions();

    const html = actions.renderMarkdown(markdown);

    expect(html).toMatchSnapshot();
  });
});
