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
} from '../../helpers';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { serverIsFeatureEnabled } from '@utils/server-features';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitLetterTemplate');
jest.mock('@utils/server-features');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);
const serverIsFeatureEnabledMock = jest.mocked(serverIsFeatureEnabled);

describe('SubmitLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test.each([true, false])(
    'should load page when client proofing is %s',
    async (clientProofingEnabled) => {
      getTemplateMock.mockResolvedValue({
        ...LETTER_TEMPLATE,
        createdAt: 'today',
        updatedAt: 'today',
      });

      serverIsFeatureEnabledMock.mockResolvedValueOnce(clientProofingEnabled);

      const page = await SubmitLetterTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(page).toEqual(
        <SubmitLetterTemplate
          templateName={LETTER_TEMPLATE.name}
          templateId={LETTER_TEMPLATE.id}
          proofingEnabled={clientProofingEnabled}
        />
      );

      expect(serverIsFeatureEnabledMock).toHaveBeenCalledWith('proofing');
    }
  );

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
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
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );

  test('should generate metadata', async () => {
    const metadata = await generateMetadata();

    expect(metadata).toEqual({
      title: 'Submit letter template',
    });
  });
});
