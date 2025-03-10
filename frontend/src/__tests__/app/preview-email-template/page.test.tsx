/**
 * @jest-environment node
 */
import PreviewEmailTemplatePage from '@app/preview-email-template/[templateId]/page';
import { PreviewEmailTemplate } from '@forms/PreviewEmailTemplate';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';
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
jest.mock('@forms/PreviewEmailTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: 'EMAIL',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDTO;

    const emailTemplate: EmailTemplate = {
      ...templateDTO,
      subject: 'template-subject-line',
      templateType: 'EMAIL',
      templateStatus: 'NOT_YET_SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(<PreviewEmailTemplate initialState={emailTemplate} />);
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await PreviewEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    SMS_TEMPLATE,
    NHS_APP_TEMPLATE,
    LETTER_TEMPLATE,
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
    'should redirect to invalid-template when template is $templateType and name is $emailTemplateName and subjectLine is $$emailTemplateSubjectLine and message is $emailTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await PreviewEmailTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
