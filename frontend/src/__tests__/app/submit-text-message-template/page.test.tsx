/**
 * @jest-environment node
 */
import SubmitSmsTemplatePage from '@app/submit-text-message-template/[templateId]/page';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '../../helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitTemplate');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('SubmitSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      message: 'template-message',
    } satisfies Partial<TemplateDto>;

    getTemplateMock.mockResolvedValue({
      ...state,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await SubmitSmsTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <SubmitTemplate
        templateName={state.name}
        templateId={state.id}
        goBackPath='preview-text-message-template'
        submitPath='text-message-template-submitted'
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitSmsTemplatePage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    EMAIL_TEMPLATE,
    NHS_APP_TEMPLATE,
    LETTER_TEMPLATE,
    {
      ...SMS_TEMPLATE,
      message: undefined as unknown as string,
    },
    {
      ...SMS_TEMPLATE,
      name: undefined as unknown as string,
    },
    {
      ...SMS_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $smsTemplateName and message is $smsTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await SubmitSmsTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
