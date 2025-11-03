import {
  previewEmailTemplateAction,
  $FormSchema,
} from '@forms/PreviewEmailTemplate';
import { redirect } from 'next/navigation';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';
import { getMockFormData } from '@testhelpers/helpers';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: EmailTemplate = {
  id: 'template-id',
  templateType: 'EMAIL',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'template-name',
  subject: 'template-subject',
  message: 'template-message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('previewEmailTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await previewEmailTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          previewEmailTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-email-template page when email-edit is selected', async () => {
    await previewEmailTemplateAction(
      initialState,
      getMockFormData({
        previewEmailTemplateAction: 'email-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-email-template/template-id',
      'push'
    );
  });

  it('should redirect to submit-email-template page when email-submit is selected', async () => {
    await previewEmailTemplateAction(
      initialState,
      getMockFormData({
        previewEmailTemplateAction: 'email-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-email-template/template-id',
      'push'
    );
  });

  it('should throw error when preview action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        previewEmailTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      previewEmailTemplateAction(
        initialState,
        getMockFormData({
          previewEmailTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown preview email template action.');
  });
});
