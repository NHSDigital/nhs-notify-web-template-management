import { getMockFormData } from '@testhelpers';
import { saveSession } from '@utils/form-actions';
import { Session, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { createSmsTemplateAction } from '@forms/CreateSmsTemplate/server-action';

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

  it('should return response when no template name or template message', async () => {
    const response = await createSmsTemplateAction(
      initialState,
      getMockFormData({})
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

  it('should return response when when template message is too long', async () => {
    const response = await createSmsTemplateAction(
      initialState,
      getMockFormData({
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

  it('should save the session and redirect to preview sms-template', async () => {
    saveSessionMock.mockResolvedValue({
      ...initialState,
      smsTemplateName: 'template-name',
      smsTemplateMessage: 'template-message',
      updatedAt: 'today',
      createdAt: 'today',
      ttl: 0,
    });

    await createSmsTemplateAction(
      initialState,
      getMockFormData({
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
      })
    );

    expect(saveSessionMock).toHaveBeenCalledWith({
      id: initialState.id,
      templateType: initialState.templateType,
      smsTemplateName: 'template-name',
      smsTemplateMessage: 'template-message',
      nhsAppTemplateMessage: ' ', // TODO: this needs to be optional
      nhsAppTemplateName: ' ', // TODO: this needs to be optional
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-sms-template/session-id',
      'push'
    );
  });
});
