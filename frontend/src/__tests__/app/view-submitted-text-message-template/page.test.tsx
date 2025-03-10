/**
 * @jest-environment node
 */
import ViewSubmittedSMSTemplatePage from '@app/view-submitted-text-message-template/[templateId]/page';
import { ViewSMSTemplate } from '@molecules/ViewSMSTemplate/ViewSMSTemplate';
import { SMSTemplate } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '../../helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: 'SMS',
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDTO;

    const submittedSMSTemplate: SMSTemplate = {
      ...templateDTO,
      templateType: 'SMS',
      templateStatus: TemplateStatus.SUBMITTED,
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await ViewSubmittedSMSTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <ViewSMSTemplate initialState={submittedSMSTemplate} />
    );
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await ViewSubmittedSMSTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      ...EMAIL_TEMPLATE,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...NHS_APP_TEMPLATE,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...SMS_TEMPLATE,
      message: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...SMS_TEMPLATE,
      name: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...SMS_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...SMS_TEMPLATE,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await ViewSubmittedSMSTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
