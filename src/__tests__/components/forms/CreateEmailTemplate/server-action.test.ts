import { getMockFormData } from '@testhelpers';
import { saveSession } from '@utils/form-actions';
import { Session, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/CreateEmailTemplate/server-action';

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
        formErrors: [],
        fieldErrors: {
          formId: ['Internal server error'],
        },
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
    '$formId - should save the session and redirect to $route',
    async ({ formId, route }) => {
      saveSessionMock.mockResolvedValue({
        ...initialState,
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'template-message',
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

      expect(saveSessionMock).toHaveBeenCalledWith({
        id: initialState.id,
        templateType: initialState.templateType,
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'template-message',
        nhsAppTemplateMessage: '',
        nhsAppTemplateName: '',
      });

      expect(redirectMock).toHaveBeenCalledWith(`/${route}/session-id`, 'push');
    }
  );
});
