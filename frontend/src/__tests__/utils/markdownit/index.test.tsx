import {
  MarkdownItWrapper,
  renderEmailMarkdown,
  renderNHSAppMarkdown,
  renderSMSMarkdown,
  withEmbeddedLink,
} from '@utils/markdownit';
import { mockDeep } from 'jest-mock-extended';
import { markdown } from '../../components/forms/fixtures';

describe('renderEmailMarkdown', () => {
  beforeEach(jest.resetAllMocks);

  it('should enable email markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderEmailMarkdown('message', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'link',
      'list',
      'emphasis',
      'hr',
    ]);
  });

  it('should only process email markdown rules', () => {
    expect(renderEmailMarkdown(markdown)).toMatchSnapshot();
  });
});

describe('renderNHSAppMarkdown', () => {
  it('should enable nhs app markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderNHSAppMarkdown('example', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'link',
      'list',
      'emphasis',
    ]);
  });

  it('should only process nhs app markdown rules', () => {
    expect(renderNHSAppMarkdown(markdown)).toMatchSnapshot();
  });
});

describe('renderSMSMarkdown', () => {
  beforeEach(jest.resetAllMocks);

  it('should enable text message markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderSMSMarkdown('message', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).not.toHaveBeenCalled();

    expect(markdownItWrapperMock.enable).not.toHaveBeenCalled();
  });

  it('should only process text message markdown rules', () => {
    expect(renderSMSMarkdown(markdown)).toMatchSnapshot();
  });
});

describe('withEmbeddedLink', () => {
  beforeEach(jest.resetAllMocks);

  it('should enable links', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    withEmbeddedLink('message with a [link](link.com)', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith('link');
  });

  it('should only process links and line breaks rules', () => {
    expect(withEmbeddedLink(markdown)).toMatchSnapshot();
  });
});
