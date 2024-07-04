import { mockDeep } from 'jest-mock-extended';
import { handleForm, renderMarkdown } from '@/src/components/forms/ReviewSMSTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';
import { FormState } from '@utils/types';

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
