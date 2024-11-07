import SubmitEmailTemplatePage from '@app/submit-email-template/[templateId]/page';
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

describe('SubmitEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.EMAIL,
      EMAIL: {
        name: 'template-name',
        subject: 'template-subject-line',
        message: 'template-message',
      },
    };

    getTemplateMock.mockResolvedValue(state);

    const page = await SubmitEmailTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(
      <SubmitTemplate
        templateName={state.EMAIL.name}
        templateId={state.id}
        goBackPath='preview-email-template'
        submitPath='email-template-submitted'
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitEmailTemplatePage({
      params: {
        templateId: 'invalid-template',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.LETTER,
      EMAIL: {
        name: 'template-name',
        subject: 'template-subject-line',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.SMS,
      EMAIL: {
        name: 'template-name',
        subject: 'template-subject-line',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.NHS_APP,
      EMAIL: {
        name: 'template-name',
        subject: 'template-subject-line',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.EMAIL,
      EMAIL: {
        name: undefined as unknown as string,
        subject: 'template-subject-line',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.EMAIL,
      EMAIL: {
        name: 'template-name',
        subject: undefined as unknown as string,
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.EMAIL,
      EMAIL: {
        name: 'template-name',
        subject: 'template-subject-line',
        message: undefined as unknown as string,
      },
    },
    {
      templateType: TemplateType.EMAIL,
      EMAIL: {
        name: 'template-name',
        subject: 'template-subject-line',
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

      await SubmitEmailTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
