/**
 * @jest-environment node
 */
import SubmitLetterTemplatePage, {
  generateMetadata,
} from '@app/submit-letter-template/[templateId]/page';
import { SubmitLetterTemplate } from '@forms/SubmitTemplate/SubmitLetterTemplate';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { fetchClient } from '@utils/server-features';
import content from '@content/content';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitLetterTemplate');
jest.mock('@utils/server-features');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);
const fetchClientMock = jest.mocked(fetchClient);

describe('SubmitLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should load page', async () => {
    getTemplateMock.mockResolvedValue({
      ...LETTER_TEMPLATE,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await SubmitLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '42' }),
    });

    expect(page).toEqual(
      <SubmitLetterTemplate
        templateName={LETTER_TEMPLATE.name}
        templateId={LETTER_TEMPLATE.id}
        lockNumber={42}
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
      searchParams: Promise.resolve({ lockNumber: '42' }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    EMAIL_TEMPLATE,
    NHS_APP_TEMPLATE,
    SMS_TEMPLATE,
    {
      ...LETTER_TEMPLATE,
      files: undefined as unknown as LetterTemplate['files'],
    } as TemplateDto,
    {
      ...LETTER_TEMPLATE,
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: undefined as unknown as string,
          virusScanStatus: 'PASSED',
        },
      },
    } as TemplateDto,
  ])(
    'should redirect to invalid-template when template is $templateType and LETTER required fields are missing',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await SubmitLetterTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );

  test('should redirect to template preview when lock number search parameter is invalid', async () => {
    await SubmitLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-letter-template/template-id',
      'replace'
    );
  });

  test('should generate metadata with routing-enabled title when routing feature is enabled', async () => {
    fetchClientMock.mockResolvedValueOnce({
      features: { routing: true },
      campaignIds: [],
    });

    const metadata = await generateMetadata();

    expect(metadata).toEqual({
      title: content.pages.submitLetterTemplate.routingFlagEnabled.pageTitle,
    });
  });

  test('should generate metadata with routing-disabled title when routing feature is disabled', async () => {
    fetchClientMock.mockResolvedValueOnce({
      features: { routing: false },
      campaignIds: [],
    });

    const metadata = await generateMetadata();

    expect(metadata).toEqual({
      title: content.pages.submitLetterTemplate.routingFlagDisabled.pageTitle,
    });
  });

  test('should generate metadata with routing-disabled title when fetchClient returns null', async () => {
    fetchClientMock.mockResolvedValueOnce(null);

    const metadata = await generateMetadata();

    expect(metadata).toEqual({
      title: content.pages.submitLetterTemplate.routingFlagDisabled.pageTitle,
    });
  });
});
