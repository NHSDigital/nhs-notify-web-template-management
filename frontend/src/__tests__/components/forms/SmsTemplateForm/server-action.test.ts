import { getMockFormData } from '@testhelpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import {
  SMSTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/SmsTemplateForm/server-action';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      TemplateStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: SMSTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.SMS,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  message: 'message',
};

describe('CreateSmsTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

  it('create-sms-template - should return response when no template name or template message', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-sms-template' })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          smsTemplateName: ['Enter a template name'],
          smsTemplateMessage: ['Enter a template message'],
        },
      },
    });
  });

  it('create-sms-template - should return response when when template message is too long', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-sms-template',
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'a'.repeat(919),
      })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          smsTemplateMessage: ['Template message too long'],
        },
      },
    });
  });

  test('should save the template and redirect', async () => {
    saveTemplateMock.mockResolvedValue({
      ...initialState,
      name: 'template-name',
      message: 'template-message',
    });

    await processFormActions(
      initialState,
      getMockFormData({
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).toHaveBeenCalledWith({
      ...initialState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-text-message-template/template-id?from=edit',
      'push'
    );
  });

  test('should create the template and redirect', async () => {
    const { id: _, ...initialDraftState } = initialState; // eslint-disable-line sonarjs/no-unused-vars

    createTemplateMock.mockResolvedValue({
      ...initialDraftState,
      id: 'new-template-id',
      name: 'template-name',
      message: 'template-message',
    });

    await processFormActions(
      initialDraftState,
      getMockFormData({
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
      })
    );

    expect(createTemplateMock).toHaveBeenCalledWith({
      ...initialDraftState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-text-message-template/new-template-id?from=edit',
      'push'
    );
  });
});
