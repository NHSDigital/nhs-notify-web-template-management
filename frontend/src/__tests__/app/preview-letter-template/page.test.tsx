/**
 * @jest-environment node
 */
import PreviewLetterTemplatePage from '@app/preview-letter-template/[templateId]/page';
import { type LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { Language, LetterType, TemplateDto } from 'nhs-notify-backend-client';
import { EMAIL_TEMPLATE, NHS_APP_TEMPLATE, SMS_TEMPLATE } from '../../helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

const templateDTO = {
  id: 'template-id',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'template-name',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
      currentVersion: 'saoj867b789',
      virusScanStatus: 'PASSED',
    },
    testDataCsv: {
      fileName: 'test-data.csv',
      currentVersion: '897asiahv87',
      virusScanStatus: 'FAILED',
    },
  },
} satisfies TemplateDto;

describe('PreviewLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should load page', async () => {
    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toMatchSnapshot();
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      description: 'an email',
      ...EMAIL_TEMPLATE,
    },
    {
      description: 'an SMS',
      ...SMS_TEMPLATE,
    },
    {
      description: 'an app message',
      ...NHS_APP_TEMPLATE,
    },
    {
      description: 'a letter lacking language',
      language: undefined as unknown as Language,
    },
    {
      description: 'a letter lacking a name',
      name: undefined as unknown as string,
    },
    {
      description: 'a letter lacking letterType',
      letterType: undefined as unknown as LetterType,
    },
    {
      description: 'a letter lacking pdfTemplate fileName',
      files: {
        pdfTemplate: {
          fileName: undefined as unknown as string,
          currentVersion: 'uuid',
          virusScanStatus: 'FAILED' as const,
        },
      },
    },
    {
      description: 'a letter where files is the wrong data type',
      files: [] as unknown as LetterTemplate['files'],
    },
  ])(
    'should redirect to invalid-template when template is $description',
    async ({ description: _, ...value }) => {
      getTemplateMock.mockResolvedValueOnce({
        ...templateDTO,
        ...value,
      });

      await PreviewLetterTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
