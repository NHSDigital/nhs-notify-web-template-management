import {
  previewSmsTemplateAction,
  $FormSchema,
} from '@forms/PreviewSMSTemplate';
import { redirect } from 'next/navigation';
import { SMSTemplate } from 'nhs-notify-web-template-management-utils';
import { getMockFormData } from '@testhelpers/helpers';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: SMSTemplate = {
  id: 'template-id',
  templateType: 'SMS',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'template-name',
  message: 'template-message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('previewSmsTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await previewSmsTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          previewSMSTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-text-message-template page when sms-edit is selected', async () => {
    await previewSmsTemplateAction(
      initialState,
      getMockFormData({
        previewSMSTemplateAction: 'sms-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-text-message-template/template-id',
      'push'
    );
  });

  it('should redirect to submit-text-message-template page when sms-submit is selected', async () => {
    await previewSmsTemplateAction(
      initialState,
      getMockFormData({
        previewSMSTemplateAction: 'sms-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-text-message-template/template-id?lockNumber=1',
      'push'
    );
  });

  it('should throw error when preview action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        previewSMSTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      previewSmsTemplateAction(
        initialState,
        getMockFormData({
          previewSMSTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown preview sms template action.');
  });
});
