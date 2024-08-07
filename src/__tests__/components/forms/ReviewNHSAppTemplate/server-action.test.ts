import { mockDeep } from 'jest-mock-extended';
import {
  renderMarkdown,
  reviewNhsAppTemplateAction,
} from '@forms/ReviewNHSAppTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { getMockFormData } from '@testhelpers';
import { TemplateFormState, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { markdown } from '../fixtures';

jest.mock('next/navigation');

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
    const mockRedirect = jest.mocked(redirect);

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

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should return submit page when submit action is chosen', () => {
    const mockRedirect = jest.mocked(redirect);

    const formData = getMockFormData({
      reviewNHSAppTemplateAction: 'nhsapp-submit',
    });

    reviewNhsAppTemplateAction(currentState, formData);

    expect(mockRedirect).toHaveBeenCalledWith('/submit-template/session-id');
  });

  it('should return previous edit page when edit action is chosen', () => {
    const mockRedirect = jest.mocked(redirect);

    const formData = getMockFormData({
      reviewNHSAppTemplateAction: 'nhsapp-edit',
    });

    reviewNhsAppTemplateAction(currentState, formData);

    expect(mockRedirect).toHaveBeenCalledWith(
      '/create-nhs-app-template/session-id'
    );
  });
});
