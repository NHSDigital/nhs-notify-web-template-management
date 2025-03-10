/**
 * @jest-environment node
 */
import PreviewSMSTemplatePage from '@app/preview-text-message-template/[templateId]/page';
import { PreviewSMSTemplate } from '@forms/PreviewSMSTemplate';
import { SMSTemplate } from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '../../helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/PreviewSMSTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDTO;

    const smsTemplate: SMSTemplate = {
      ...templateDTO,
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewSMSTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(<PreviewSMSTemplate initialState={smsTemplate} />);
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewSMSTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
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

      await PreviewSMSTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
