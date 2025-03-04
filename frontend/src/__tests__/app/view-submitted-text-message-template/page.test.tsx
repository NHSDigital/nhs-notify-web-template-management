/**
 * @jest-environment node
 */
import ViewSubmittedSMSTemplatePage from '@app/view-submitted-text-message-template/[templateId]/page';
import { ViewSMSTemplate } from '@molecules/ViewSMSTemplate/ViewSMSTemplate';
import {
  SMSTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDTO;

    const submittedSMSTemplate: SMSTemplate = {
      ...templateDTO,
      templateType: TemplateType.SMS,
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
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      message: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: undefined as unknown as string,
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        ...value,
        createdAt: '2025-01-13T10:19:25.579Z',
        updatedAt: '2025-01-13T10:19:25.579Z',
      });

      await ViewSubmittedSMSTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
