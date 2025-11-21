/**
 * @jest-environment node
 */
import SubmitSmsTemplatePage, {
  generateMetadata,
} from '@app/submit-text-message-template/[templateId]/page';
import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
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

describe('SubmitSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      templateType: 'SMS',
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

    const page = await SubmitSmsTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '42' }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle.SMS,
    });
    expect(page).toEqual(
      <SubmitDigitalTemplate
        templateName={state.name}
        templateId={state.id}
        channel='SMS'
        lockNumber={42}
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitSmsTemplatePage({
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
    LETTER_TEMPLATE,
    {
      ...SMS_TEMPLATE,
      message: undefined as unknown as string,
    },
    {
      ...SMS_TEMPLATE,
      name: undefined as unknown as string,
    },
    {
      ...SMS_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $smsTemplateName and message is $smsTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await SubmitSmsTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );

  test('it should redirect to preview page if lockNumber search param is invalid', async () => {
    await SubmitSmsTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-text-message-template/template-id',
      'replace'
    );
  });
});
