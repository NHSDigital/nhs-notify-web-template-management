/**
 * @jest-environment node
 */
import PreviewSubmittedLetterTemplatePage, {
  generateMetadata,
} from '@app/preview-submitted-letter-template/[templateId]/page';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
  LETTER_TEMPLATE,
} from '@testhelpers/helpers';
import content from '@content/content';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import { PreviewSubmittedTemplate } from '@molecules/PreviewSubmittedTemplate/PreviewSubmittedTemplate';

const { pageTitle } = content.components.previewLetterTemplate;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewSubmittedLetterTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      createdAt: '2025-01-13T10:19:25.579Z',
      files: {
        pdfTemplate: {
          fileName: 'file.pdf',
          currentVersion: 'b',
          virusScanStatus: 'PASSED',
        },
      },
      id: 'template-id',
      language: 'en',
      letterType: 'x0',
      letterVersion: 'PDF',
      name: 'template-name',
      templateStatus: 'SUBMITTED',
      templateType: 'LETTER',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    } satisfies TemplateDto;

    const submittedLetterTemplate: LetterTemplate = {
      ...templateDTO,
      templateStatus: 'SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewSubmittedLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });
    expect(page).toEqual(
      <PreviewSubmittedTemplate
        initialState={submittedLetterTemplate}
        previewComponent={PreviewTemplateDetailsLetter}
      />
    );
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewSubmittedLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      ...EMAIL_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...SMS_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...NHS_APP_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...LETTER_TEMPLATE,
      name: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...LETTER_TEMPLATE,
      templateStatus: 'NOT_YET_SUBMITTED' as const,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await PreviewSubmittedLetterTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
