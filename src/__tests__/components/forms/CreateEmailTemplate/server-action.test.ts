import { getMockFormData } from '@testhelpers';
import { saveTemplate } from '@utils/form-actions';
import { Template, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/CreateEmailTemplate/server-action';
import { MAX_EMAIL_CHARACTER_LENGTH } from '@utils/constants';

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
  templateType: TemplateType.EMAIL,
};

describe('CreateEmailTemplate server actions', () => {
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

  it('create-email-template - should return response when no template name, template subject line or template message', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-email-template' })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          emailTemplateName: ['Enter a template name'],
          emailTemplateSubjectLine: ['Enter a template subject line'],
          emailTemplateMessage: ['Enter a template message'],
        },
      },
    });
  });

  it('create-sms-template - should return response when when template message is too long', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-email-template',
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'a'.repeat(MAX_EMAIL_CHARACTER_LENGTH + 1),
      })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          emailTemplateMessage: ['Template message too long'],
        },
      },
    });
  });

  it('create-email-template-back - should return response when no template name, template subject line or template message', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-email-template-back' })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          emailTemplateName: ['Internal server error'],
          emailTemplateSubjectLine: ['Internal server error'],
          emailTemplateMessage: ['Internal server error'],
        },
      },
    });
  });

  test.each([
    { formId: 'create-email-template', route: 'preview-email-template' },
    { formId: 'create-email-template-back', route: 'choose-a-template-type' },
  ])(
    '$formId - should save the template and redirect to $route',
    async ({ formId, route }) => {
      saveTemplateMock.mockResolvedValue({
        ...initialState,
        EMAIL: {
          name: 'template-name',
          subject: 'template-subject-line',
          message: 'template-message',
        },
      });

      await processFormActions(
        initialState,
        getMockFormData({
          'form-id': formId,
          emailTemplateName: 'template-name',
          emailTemplateSubjectLine: 'template-subject-line',
          emailTemplateMessage: 'template-message',
        })
      );

      expect(saveTemplateMock).toHaveBeenCalledWith({
        id: initialState.id,
        version: 1,
        templateType: initialState.templateType,
        EMAIL: {
          name: 'template-name',
          subject: 'template-subject-line',
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
