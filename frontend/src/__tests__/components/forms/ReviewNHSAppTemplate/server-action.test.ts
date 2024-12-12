import { mockDeep } from 'jest-mock-extended';
import { redirect } from 'next/navigation';
import {
  renderMarkdown,
  reviewNhsAppTemplateAction,
} from '@forms/ReviewNHSAppTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { getMockFormData } from '@testhelpers';
import {
  NHSAppTemplate,
  TemplateFormState,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { markdown } from '../fixtures';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

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
  const currentState: TemplateFormState<NHSAppTemplate> = {
    id: 'template-id',
    version: 1,
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'Example name',
    message: 'Example message',
    validationError: undefined,
  };

  beforeEach(() => jest.clearAllMocks());

  it('should return validation errors when no choice is selected', () => {
    const formData = getMockFormData({});

    const newState = reviewNhsAppTemplateAction(currentState, formData);

    expect(newState).toEqual({
      id: 'template-id',
      version: 1,
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'Example name',
      message: 'Example message',
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

    reviewNhsAppTemplateAction(currentState, formData);

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-nhs-app-template/template-id',
      'push'
    );
  });

  it('should return previous edit page when edit action is chosen', () => {
    const formData = getMockFormData({
      reviewNHSAppTemplateAction: 'nhsapp-edit',
    });

    reviewNhsAppTemplateAction(currentState, formData);

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-nhs-app-template/template-id',
      'push'
    );
  });
});
