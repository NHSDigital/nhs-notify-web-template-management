import { mockDeep } from 'jest-mock-extended';
import {
  renderMarkdown,
  handleForm,
} from '@/src/components/forms/ReviewEmailTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';
import { FormState } from '@utils/types';

describe('Preview email server actions', () => {
  it('should enable email markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderMarkdown('message', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'link',
      'list',
      'hr',
    ]);
  });

  it('should only process email markdown rules', () => {
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
