import PreviewSMSTemplatePage from '@app/preview-text-message-template/[templateId]/page';
import { ReviewSMSTemplate } from '@forms/ReviewSMSTemplate';
import { SMSTemplate } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewSMSTemplate');
jest.mock('@utils/logger');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state: SMSTemplate = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.SMS,
      SMS: {
        name: 'template-name',
        message: 'template-message',
      },
    };

    getTemplateMock.mockResolvedValueOnce(state);

    const page = await PreviewSMSTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(<ReviewSMSTemplate initialState={state} />);
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewSMSTemplatePage({
      params: {
        templateId: 'template-id',
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

      await PreviewSMSTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
