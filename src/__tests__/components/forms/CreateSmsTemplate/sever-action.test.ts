import { getMockFormData } from '@testhelpers';
import { saveTemplate } from '@utils/form-actions';
import { Template, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/CreateSmsTemplate/server-action';

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
const redirectMock = jest.mocked(redirect);

const initialState: Template = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.SMS,
};

describe('CreateSmsTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

  it('should return response when no form-id', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: ['Internal server error'],
        fieldErrors: {},
      },
    });
  });

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

  it('create-sms-template-back - should return response when no template name or template message', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-sms-template-back' })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          smsTemplateName: ['Internal server error'],
          smsTemplateMessage: ['Internal server error'],
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

  test.each([
    { formId: 'create-sms-template', route: 'preview-text-message-template' },
    { formId: 'create-sms-template-back', route: 'choose-a-template-type' },
  ])(
    '$formId - should save the template and redirect to $route',
    async ({ formId, route }) => {
      saveTemplateMock.mockResolvedValue({
        ...initialState,
        SMS: {
          name: 'template-name',
          message: 'template-message',
        },
      });

      await processFormActions(
        initialState,
        getMockFormData({
          'form-id': formId,
          smsTemplateName: 'template-name',
          smsTemplateMessage: 'template-message',
        })
      );

      expect(saveTemplateMock).toHaveBeenCalledWith({
        ...initialState,
        SMS: {
          name: 'template-name',
          message: 'template-message',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith(
        `/${route}/template-id`,
        'push'
      );
    }
  );
});
