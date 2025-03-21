/**
 * @jest-environment node
 */
import SubmitEmailTemplatePage from '@app/submit-email-template/[templateId]/page';
import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import { EMAIL_TEMPLATE, NHS_APP_TEMPLATE, SMS_TEMPLATE } from '../../helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitDigitalTemplate');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('SubmitEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      templateType: 'EMAIL',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    } satisfies Partial<TemplateDto>;

    getTemplateMock.mockResolvedValue({
      ...state,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await SubmitEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <SubmitDigitalTemplate
        templateName={state.name}
        templateId={state.id}
        goBackPath='preview-email-template'
        submitPath='email-template-submitted'
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    SMS_TEMPLATE,
    NHS_APP_TEMPLATE,
    {
      ...EMAIL_TEMPLATE,
      name: undefined as unknown as string,
    },
    {
      ...EMAIL_TEMPLATE,
      subject: undefined as unknown as string,
    },
    {
      ...EMAIL_TEMPLATE,
      message: undefined as unknown as string,
    },
    {
      ...EMAIL_TEMPLATE,
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $smsTemplateName and message is $smsTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await SubmitEmailTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
