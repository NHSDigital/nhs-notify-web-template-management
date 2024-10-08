import { mockDeep } from 'jest-mock-extended';
import {
  renderMarkdown,
  reviewNhsAppTemplateAction,
} from '@forms/ReviewNHSAppTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { getMockFormData } from '@testhelpers';
import { TemplateFormState, TemplateType } from '@utils/types';
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

describe('reviewNhsAppTemplateAction', () => {
  const currentState: TemplateFormState = {
    id: 'session-id',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: 'Example name',
    nhsAppTemplateMessage: 'Example message',
    validationError: undefined,
  };

  beforeEach(() => jest.clearAllMocks());

  it('should return validation errors when no choice is selected', () => {
    const formData = getMockFormData({});

    const newState = reviewNhsAppTemplateAction(currentState, formData);

    expect(newState).toEqual({
      id: 'session-id',
      templateType: 'NHS_APP',
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

    const response = reviewNhsAppTemplateAction(currentState, formData);

    expect(response).toEqual({
      ...currentState,
      redirect: '/submit-nhs-app-template/session-id',
    });
  });

  it('should return previous edit page when edit action is chosen', () => {
    const formData = getMockFormData({
      reviewNHSAppTemplateAction: 'nhsapp-edit',
    });

    const response = reviewNhsAppTemplateAction(currentState, formData);

    expect(response).toEqual({
      ...currentState,
      redirect: '/create-nhs-app-template/session-id',
    });
  });
});
