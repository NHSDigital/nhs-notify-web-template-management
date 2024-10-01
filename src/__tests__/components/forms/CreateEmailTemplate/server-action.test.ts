import { createEmailTemplateAction } from '@forms/CreateEmailTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { TemplateType } from '@utils/types';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      SessionStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));

const initialState = {
  id: 'session-id',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
  emailTemplateName: '',
  emailTemplateSubjectLine: '',
  emailTemplateMessage: '',
};

test('invalid form id', async () => {
  const response = await createEmailTemplateAction(
    initialState,
    getMockFormData({
      'form-id': 'lemons',
    })
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

test('submit form - no validation error', async () => {
  const response = await createEmailTemplateAction(
    initialState,
    getMockFormData({
      'form-id': 'create-email-template',
      emailTemplateName: 'template-name',
      emailTemplateSubjectLine: 'template-subject-line',
      emailTemplateMessage: 'template-message',
    })
  );

  expect(response).toEqual({
    ...initialState,
    emailTemplateName: 'template-name',
    emailTemplateSubjectLine: 'template-subject-line',
    emailTemplateMessage: 'template-message',
    redirect: '/preview-email-template/session-id',
  });
});

test('submit form - validation error', async () => {
  const response = await createEmailTemplateAction(
    initialState,
    getMockFormData({
      'form-id': 'create-email-template',
      emailTemplateName: '',
      emailTemplateSubjectLine: '',
      emailTemplateMessage: '',
    })
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

test('back - no validation error', async () => {
  const response = await createEmailTemplateAction(
    initialState,
    getMockFormData({
      'form-id': 'create-email-template-back',
      emailTemplateName: 'template-name',
      emailTemplateSubjectLine: 'template-subject-line',
      emailTemplateMessage: 'template-message',
    })
  );

  expect(response).toEqual({
    ...initialState,
    emailTemplateName: 'template-name',
    emailTemplateSubjectLine: 'template-subject-line',
    emailTemplateMessage: 'template-message',
    redirect: '/choose-a-template-type/session-id',
  });
});

test('back - validation error', async () => {
  const response = await createEmailTemplateAction(
    initialState,
    getMockFormData({
      'form-id': 'create-email-template-back',
      emailTemplateName: 'template-name',
      emailTemplateSubjectLine: 'template-subject-line',
      emailTemplateMessage: 7 as unknown as string,
    })
  );

  expect(response).toEqual({
    ...initialState,
    validationError: {
      formErrors: [],
      fieldErrors: {
        emailTemplateMessage: ['Internal server error'],
      },
    },
  });
});
