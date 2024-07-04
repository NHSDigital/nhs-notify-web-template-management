import { mockDeep } from 'jest-mock-extended';
import {
  handleForm,
  renderMarkdown,
} from '@/src/components/forms/ReviewLetterTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';
import { FormState } from '@utils/types';

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

  it('should handle form', () => {
    const state: FormState = {
      formErrors: [],
      fieldErrors: {},
    };

    const form = mockDeep<FormData>();

    const response = handleForm(state, form);

    expect(response).toEqual(state);
  });
});
