/**
 * @jest-environment node
 */
import PreviewEmailTemplatePage from '@app/preview-email-template/[templateId]/page';
import { ReviewEmailTemplate } from '@forms/ReviewEmailTemplate';
import {
  EmailTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewEmailTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO: TemplateDTO = {
      id: 'template-id',
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    const emailTemplate: EmailTemplate = {
      ...templateDTO,
      subject: 'template-subject-line',
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    }

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewEmailTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(<ReviewEmailTemplate initialState={emailTemplate} />);
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await PreviewEmailTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    },
    {
      templateType: TemplateType.EMAIL,
      name: undefined as unknown as string,
      subject: 'template-subject-line',
      message: 'template-message',
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: undefined as unknown as string,
      message: 'template-message',
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: 'template-subject-line',
      message: undefined as unknown as string,
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: 'template-subject-line',
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $emailTemplateName and subjectLine is $$emailTemplateSubjectLine and message is $emailTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        ...value,
        createdAt: '2025-01-13T10:19:25.579Z',
        updatedAt: '2025-01-13T10:19:25.579Z',
      });

      await PreviewEmailTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
