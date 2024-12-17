import {
  reviewEmailTemplateAction,
  $FormSchema,
} from '@forms/ReviewEmailTemplate';
import { redirect } from 'next/navigation';
import {
  EmailTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { getMockFormData } from '@testhelpers';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: EmailTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.EMAIL,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'template-name',
  subject: 'template-subject',
  message: 'template-message',
};

describe('reviewEmailTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await reviewEmailTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          reviewEmailTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-email-template page when email-edit is selected', async () => {
    await reviewEmailTemplateAction(
      initialState,
      getMockFormData({
        reviewEmailTemplateAction: 'email-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-email-template/template-id',
      'push'
    );
  });

  it('should redirect to submit-email-template page when email-submit is selected', async () => {
    await reviewEmailTemplateAction(
      initialState,
      getMockFormData({
        reviewEmailTemplateAction: 'email-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-email-template/template-id',
      'push'
    );
  });

  it('should throw error when review action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        reviewEmailTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      reviewEmailTemplateAction(
        initialState,
        getMockFormData({
          reviewEmailTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown review email template action.');
  });
});
