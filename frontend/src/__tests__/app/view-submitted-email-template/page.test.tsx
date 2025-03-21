/**
 * @jest-environment node
 */
import ViewSubmittedEmailTemplatePage, {
  generateMetadata,
} from '@app/view-submitted-email-template/[templateId]/page';
import { ViewEmailTemplate } from '@molecules/ViewEmailTemplate/ViewEmailTemplate';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-backend-client';
import { EMAIL_TEMPLATE, NHS_APP_TEMPLATE, SMS_TEMPLATE } from '../../helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    generateMetadata();
    const templateDTO = {
      id: 'template-id',
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    const submittedEmailTemplate: EmailTemplate = {
      ...templateDTO,
      subject: 'template-subject-line',
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await ViewSubmittedEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <ViewEmailTemplate initialState={submittedEmailTemplate} />
    );
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await ViewSubmittedEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      ...SMS_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...NHS_APP_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...EMAIL_TEMPLATE,
      name: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...EMAIL_TEMPLATE,
      subject: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...EMAIL_TEMPLATE,
      message: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...EMAIL_TEMPLATE,
      message: null as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...EMAIL_TEMPLATE,
      templateStatus: 'NOT_YET_SUBMITTED' as const,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, subjectLine is $subject, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await ViewSubmittedEmailTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
