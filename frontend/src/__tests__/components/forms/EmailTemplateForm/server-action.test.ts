import { getMockFormData } from '@testhelpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/EmailTemplateForm/server-action';
import { MAX_EMAIL_CHARACTER_LENGTH } from '@utils/constants';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: EmailTemplate = {
  id: 'template-id',
  templateType: 'EMAIL',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  subject: 'subject',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
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

  test('should save the template and redirect', async () => {
    saveTemplateMock.mockResolvedValue({
      ...initialState,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
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
      ...initialState,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-email-template/template-id?from=edit',
      'push'
    );
  });

  test('should create the template and redirect', async () => {
    const { id: _, ...initialDraftState } = initialState; // eslint-disable-line sonarjs/no-unused-vars

    createTemplateMock.mockResolvedValue({
      ...initialDraftState,
      id: 'new-template-id',
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
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
      ...initialDraftState,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-email-template/new-template-id?from=edit',
      'push'
    );
  });
});
