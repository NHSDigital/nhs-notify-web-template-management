import { reviewSmsTemplateAction, $FormSchema } from '@forms/ReviewSMSTemplate';
import { redirect } from 'next/navigation';
import {
  SMSTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { getMockFormData } from '@testhelpers';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: SMSTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.SMS,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'template-name',
  message: 'template-message',
};

describe('reviewSmsTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await reviewSmsTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          reviewSMSTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-text-message-template page when sms-edit is selected', async () => {
    await reviewSmsTemplateAction(
      initialState,
      getMockFormData({
        reviewSMSTemplateAction: 'sms-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-text-message-template/template-id',
      'push'
    );
  });

  it('should redirect to submit-text-message-template page when sms-submit is selected', async () => {
    await reviewSmsTemplateAction(
      initialState,
      getMockFormData({
        reviewSMSTemplateAction: 'sms-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-text-message-template/template-id',
      'push'
    );
  });

  it('should throw error when review action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        reviewSMSTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      reviewSmsTemplateAction(
        initialState,
        getMockFormData({
          reviewSMSTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown review sms template action.');
  });
});
