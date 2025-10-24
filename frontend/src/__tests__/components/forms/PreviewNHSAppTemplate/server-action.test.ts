import { redirect } from 'next/navigation';
import { previewNhsAppTemplateAction } from '@forms/PreviewNHSAppTemplate';
import { getMockFormData } from '@testhelpers/helpers';
import {
  NHSAppTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

describe('previewNhsAppTemplateAction', () => {
  const currentState: TemplateFormState<NHSAppTemplate> = {
    id: 'template-id',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'Example name',
    message: 'Example message',
    errorState: undefined,
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
    lockNumber: 1,
  };

  beforeEach(() => jest.clearAllMocks());

  it('should return validation errors when no choice is selected', () => {
    const formData = getMockFormData({});

    const newState = previewNhsAppTemplateAction(currentState, formData);

    expect(newState).toEqual({
      ...currentState,
      errorState: {
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
