import { mockDeep } from 'jest-mock-extended';
import {
  handleForm,
  renderMarkdown,
} from '@/src/components/forms/ReviewNHSAppTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { markdown } from '../fixtures';
import { FormState } from '@utils/types';

describe('PreviewNHSAppActions', () => {
  it('should enable nhs app markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderMarkdown('example', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'link',
      'list',
      'emphasis',
    ]);
  });

  it('should only process nhs app markdown rules', () => {
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
