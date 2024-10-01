import { getMockFormData } from '@testhelpers';
import { saveSession } from '@utils/form-actions';
import { Session, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/CreateSmsTemplate/server-action';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      SessionStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveSessionMock = jest.mocked(saveSession);
const redirectMock = jest.mocked(redirect);

const initialState: Session = {
  id: 'session-id',
  templateType: TemplateType.SMS,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
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
        formErrors: [],
        fieldErrors: {
          formId: ['Internal server error'],
        },
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
    '$formId - should save the session and redirect to $route',
    async ({ formId, route }) => {
      saveSessionMock.mockResolvedValue({
        ...initialState,
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
        updatedAt: 'today',
        createdAt: 'today',
        ttl: 0,
      });

      await processFormActions(
        initialState,
        getMockFormData({
          'form-id': formId,
          smsTemplateName: 'template-name',
          smsTemplateMessage: 'template-message',
        })
      );

      expect(saveSessionMock).toHaveBeenCalledWith({
        id: initialState.id,
        templateType: initialState.templateType,
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
        nhsAppTemplateMessage: '',
        nhsAppTemplateName: '',
      });

      expect(redirectMock).toHaveBeenCalledWith(`/${route}/session-id`, 'push');
    }
  );
});
