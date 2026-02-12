/**
 * @jest-environment node
 */
import SubmitNhsAppTemplatePage, {
  generateMetadata,
} from '@app/submit-nhs-app-template/[templateId]/page';
import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
import { NHSNotifyContainer } from '@layouts/container/container';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import content from '@content/content';

const { pageTitle } = content.components.submitTemplate;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitDigitalTemplate');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('SubmitNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      message: 'template-message',
      lockNumber: 1,
    } satisfies Partial<TemplateDto>;

    getTemplateMock.mockResolvedValue({
      ...state,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await SubmitNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle.NHS_APP,
    });
    expect(page).toEqual(
      <NHSNotifyContainer>
        <SubmitDigitalTemplate
          templateName={state.name}
          templateId={state.id}
          channel='NHS_APP'
          lockNumber={42}
        />
      </NHSNotifyContainer>
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    EMAIL_TEMPLATE,
    SMS_TEMPLATE,
    PDF_LETTER_TEMPLATE,
    {
      ...NHS_APP_TEMPLATE,
      message: undefined as unknown as string,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: undefined as unknown as string,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $nhsAppTemplateName and message is $nhsAppTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await SubmitNhsAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
        searchParams: Promise.resolve({
          lockNumber: '42',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );

  test('it should redirect to preview page if lockNumber search param is invalid', async () => {
    await SubmitNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-nhs-app-template/template-id',
      'replace'
    );
  });
});
