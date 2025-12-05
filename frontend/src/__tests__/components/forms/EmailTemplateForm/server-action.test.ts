import { getMockFormData } from '@testhelpers/helpers';
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
  id: '89cc73bb-6d61-4b8b-a728-b5e40f0751fd',
  templateType: 'EMAIL',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  subject: 'subject',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
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
      errorState: {
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
      errorState: {
        formErrors: [],
        fieldErrors: {
          emailTemplateMessage: ['Template message too long'],
        },
      },
    });
  });

  it('create-email-template - should return response when when template message contains insecure url', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-email-template',
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: '**a message linking to http://www.example.com**',
      })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          emailTemplateMessage: ['URLs must start with https://'],
        },
      },
    });
  });

  it('create-email-template - should return response when when template message contains unsupported personalisation', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-email-template',
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'a template message containing ((date))',
      })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          emailTemplateMessage: [
            'Template message contains invalid personalisation fields',
          ],
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

    expect(saveTemplateMock).toHaveBeenCalledWith(initialState.id, {
      ...initialState,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-email-template/${initialState.id}?from=edit`,
      'push'
    );
  });

  test('redirects to invalid-template if the ID in formState is not a uuid', async () => {
    const badIdState = {
      ...initialState,
      id: 'non-uuid',
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    await processFormActions(
      badIdState,
      getMockFormData({
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).not.toHaveBeenCalled();

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test('should create the template and redirect', async () => {
    const { id: _, ...initialDraftState } = initialState; // eslint-disable-line sonarjs/no-unused-vars

    const generatedId = '06c6fb58-e749-4ee4-8343-57d7f7ecfe1f';

    createTemplateMock.mockResolvedValue({
      ...initialDraftState,
      id: generatedId,
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
      `/preview-email-template/${generatedId}?from=edit`,
      'push'
    );
  });
});
