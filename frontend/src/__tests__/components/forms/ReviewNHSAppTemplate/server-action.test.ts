import { redirect } from 'next/navigation';
import { previewNhsAppTemplateAction } from '@forms/PreviewNHSAppTemplate';
import { getMockFormData } from '@testhelpers';
import {
  NHSAppTemplate,
  TemplateFormState,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

describe('previewNhsAppTemplateAction', () => {
  const currentState: TemplateFormState<NHSAppTemplate> = {
    id: 'template-id',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'Example name',
    message: 'Example message',
    validationError: undefined,
  };

  beforeEach(() => jest.clearAllMocks());

  it('should return validation errors when no choice is selected', () => {
    const formData = getMockFormData({});

    const newState = previewNhsAppTemplateAction(currentState, formData);

    expect(newState).toEqual({
      id: 'template-id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'Example name',
      message: 'Example message',
      validationError: {
        fieldErrors: {
          previewNHSAppTemplateAction: ['Select an option'],
        },
        formErrors: [],
      },
    });
  });

  it('should return submit page when submit action is chosen', () => {
    const formData = getMockFormData({
      previewNHSAppTemplateAction: 'nhsapp-submit',
    });

    previewNhsAppTemplateAction(currentState, formData);

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-nhs-app-template/template-id',
      'push'
    );
  });

  it('should return previous edit page when edit action is chosen', () => {
    const formData = getMockFormData({
      previewNHSAppTemplateAction: 'nhsapp-edit',
    });

    previewNhsAppTemplateAction(currentState, formData);

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-nhs-app-template/template-id',
      'push'
    );
  });
});
