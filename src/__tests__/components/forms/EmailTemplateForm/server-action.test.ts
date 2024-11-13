import { getMockFormData } from '@testhelpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { EmailTemplate } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/EmailTemplateForm/server-action';
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
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: EmailTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.EMAIL,
  name: 'name',
  subject: 'subject',
  message: 'message',
};

describe('CreateEmailTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

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

  it('create-email-template - should return response when when template message is too long', async () => {
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

  test('$formId - should save the template and redirect to $route', async () => {
    saveTemplateMock.mockResolvedValue({
      ...initialState,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    await processFormActions(
      initialState,
      getMockFormData({
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).toHaveBeenCalledWith({
      id: initialState.id,
      version: 1,
      templateType: initialState.templateType,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-email-template/template-id',
      'push'
    );
  });

  test('should create the template and redirect', async () => {
    const { id: _, ...initialDraftState } = initialState; // eslint-disable-line sonarjs/sonar-no-unused-vars

    createTemplateMock.mockResolvedValue({
      ...initialDraftState,
      id: 'new-template-id',
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    await processFormActions(
      initialDraftState,
      getMockFormData({
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'template-message',
      })
    );

    expect(createTemplateMock).toHaveBeenCalledWith({
      version: 1,
      templateType: initialState.templateType,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-email-template/new-template-id',
      'push'
    );
  });
});
