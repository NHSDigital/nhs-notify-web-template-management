/**
 * @jest-environment node
 */
import PreviewSubmittedEmailTemplatePage, {
  generateMetadata,
} from '@app/preview-submitted-email-template/[templateId]/page';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import content from '@content/content';
import { PreviewSubmittedTemplate } from '@molecules/PreviewSubmittedTemplate/PreviewSubmittedTemplate';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.components.previewEmailTemplate;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    } satisfies TemplateDto;

    const submittedEmailTemplate: EmailTemplate = {
      ...templateDTO,
      subject: 'template-subject-line',
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewSubmittedEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });
    expect(page).toEqual(
      <NHSNotifyContainer>
        <PreviewSubmittedTemplate
          initialState={submittedEmailTemplate}
          previewComponent={PreviewTemplateDetailsEmail}
        />
      </NHSNotifyContainer>
    );
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await PreviewSubmittedEmailTemplatePage({
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

      await PreviewSubmittedEmailTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
