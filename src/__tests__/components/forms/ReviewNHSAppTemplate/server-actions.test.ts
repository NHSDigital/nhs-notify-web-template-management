import { mockDeep } from 'jest-mock-extended';
import {
  handleForm,
  handleFormBack,
  renderMarkdown,
} from '@forms/ReviewNHSAppTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { getMockFormData } from '@/src/__tests__/helpers';
import { FormState } from '@/src/utils/types';
import { markdown } from '../fixtures';

describe('Markdown rendering', () => {
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
});

describe('Form handling', () => {
  it('should return validation errors when no choice is selected', () => {
    const formData = getMockFormData({});

    const currentState: FormState = {
      page: 'review-nhs-app-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      validationError: undefined,
    };

    const newState = handleForm(currentState, formData);

    expect(newState).toEqual({
      page: 'review-nhs-app-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      validationError: {
        fieldErrors: {
          reviewNHSAppTemplateAction: ['Select an option'],
        },
        formErrors: [],
      },
    });
  });

  it('should return submit page when submit action is chosen', () => {
    const formData = getMockFormData({
      reviewNHSAppTemplateAction: 'nhsapp-submit',
    });

    const currentState: FormState = {
      page: 'review-nhs-app-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      validationError: undefined,
    };

    const newState = handleForm(currentState, formData);

    expect(newState).toEqual({
      page: 'submit-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      reviewNHSAppTemplateAction: 'nhsapp-submit',
      validationError: undefined,
    });
  });

  it('should return previous edit page when edit action is chosen', () => {
    const formData = getMockFormData({
      reviewNHSAppTemplateAction: 'nhsapp-edit',
    });

    const currentState: FormState = {
      page: 'review-nhs-app-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      validationError: undefined,
    };

    const newState = handleForm(currentState, formData);

    expect(newState).toEqual({
      page: 'create-nhs-app-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      reviewNHSAppTemplateAction: 'nhsapp-edit',
      validationError: undefined,
    });
  });

  it('should return to previous page when page handling back', () => {
    const formData = getMockFormData({});

    const currentState: FormState = {
      page: 'review-nhs-app-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      validationError: undefined,
    };

    const newState = handleFormBack(currentState, formData);

    expect(newState).toEqual({
      page: 'create-nhs-app-template',
      nhsAppTemplateName: 'Example name',
      nhsAppTemplateMessage: 'Example message',
      validationError: undefined,
    });
  });
});
