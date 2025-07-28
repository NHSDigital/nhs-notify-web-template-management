/**
 * @jest-environment node
 */
import RequestProofPage, {
  generateMetadata,
} from '@app/request-proof-of-template/[templateId]/page';
import { RequestProof } from '@forms/RequestProof/RequestProof';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '../../helpers';
import { serverIsFeatureEnabled } from '@utils/server-features';
import content from '@content/content';

const { pageTitle } = content.components.requestProof;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/RequestProof/RequestProof');
jest.mock('@utils/server-features');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);
const serverIsFeatureEnabledMock = jest.mocked(serverIsFeatureEnabled);

describe('RequestProofPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    serverIsFeatureEnabledMock.mockResolvedValueOnce(true);
  });

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x0',
      language: 'en',
      proofingEnabled: true,
      files: {
        pdfTemplate: {
          virusScanStatus: 'PASSED',
          currentVersion: 'a',
          fileName: 'a.pdf',
        },
      },
    } satisfies Partial<TemplateDto>;

    getTemplateMock.mockResolvedValue({
      ...state,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await RequestProofPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });

    expect(page).toEqual(
      <RequestProof
        templateName={state.name}
        templateId={state.id}
        channel='LETTER'
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await RequestProofPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    SMS_TEMPLATE,
    NHS_APP_TEMPLATE,
    EMAIL_TEMPLATE,
    {
      ...LETTER_TEMPLATE,
      name: undefined as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $name',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await RequestProofPage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );

  test('should forbid user from requesting a proof when client does not have feature enabled', async () => {
    serverIsFeatureEnabledMock.mockReset();
    serverIsFeatureEnabledMock.mockResolvedValueOnce(false);

    await RequestProofPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test('should forbid user from requesting a proof when proofingEnabled is false', async () => {
    const state = {
      id: 'template-id',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x0',
      language: 'ar',
      proofingEnabled: false,
      files: {
        pdfTemplate: {
          virusScanStatus: 'PASSED',
          currentVersion: 'a',
          fileName: 'a.pdf',
        },
      },
    } satisfies Partial<TemplateDto>;

    getTemplateMock.mockResolvedValue({
      ...state,
      createdAt: 'today',
      updatedAt: 'today',
    });

    await RequestProofPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
