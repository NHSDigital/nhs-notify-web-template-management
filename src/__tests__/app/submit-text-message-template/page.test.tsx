import SubmitSmsTemplatePage from '@app/submit-text-message-template/[templateId]/page';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateType } from '@utils/types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitTemplate');
jest.mock('@utils/logger');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('SubmitSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.SMS,
      SMS: {
        name: 'template-name',
        message: 'template-message',
      },
    };

    getTemplateMock.mockResolvedValue(state);

    const page = await SubmitSmsTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(
      <SubmitTemplate
        templateName={state.SMS.name}
        templateId={state.id}
        goBackPath='preview-text-message-template'
        submitPath='text-message-template-submitted'
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitSmsTemplatePage({
      params: {
        templateId: 'invalid-template',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.LETTER,
      SMS: {
        name: 'template-name',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.EMAIL,
      SMS: {
        name: 'template-name',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.NHS_APP,
      SMS: {
        name: 'template-name',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.SMS,
      SMS: {
        name: 'template-name',
        message: undefined as unknown as string,
      },
    },
    {
      templateType: TemplateType.SMS,
      SMS: {
        name: undefined as unknown as string,
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.SMS,
      SMS: {
        name: null as unknown as string,
        message: null as unknown as string,
      },
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $smsTemplateName and message is $smsTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        version: 1,
        ...value,
      });

      await SubmitSmsTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
