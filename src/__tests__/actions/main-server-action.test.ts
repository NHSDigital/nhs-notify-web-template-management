import { FormState } from '../../utils/types';
import { mainServerAction } from '../../app/choose-template/main-server-action';
import { getMockFormData } from '../helpers';

const formState: FormState = {
  page: 'choose-template',
  validationError: null,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

test('returns validation error on missing form id', () => {
  const result = mainServerAction(formState, getMockFormData({}));

  expect(result).toEqual({
    page: 'choose-template',
    validationError: {
      formErrors: [],
      fieldErrors: {
        formId: ['Internal server error'],
      },
    },
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });
});

test('returns validation error on missing server action', () => {
  const result = mainServerAction(
    formState,
    getMockFormData({
      'form-id': 'create-sms-template',
    })
  );

  expect(result).toEqual({
    page: 'choose-template',
    validationError: {
      formErrors: ['Internal server error'],
      fieldErrors: {},
    },
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });
});

test('returns error on invalid choose-template form', () => {
  const result = mainServerAction(
    formState,
    getMockFormData({
      'form-id': 'choose-template',
      page: 'wrong-page',
    })
  );

  expect(result).toEqual({
    page: 'choose-template',
    validationError: {
      formErrors: [],
      fieldErrors: {
        page: ['Select a template type'],
      },
    },
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });
});

test('returns success on valid choose-template form', () => {
  const result = mainServerAction(
    formState,
    getMockFormData({
      'form-id': 'choose-template',
      page: 'create-sms-template',
    })
  );

  expect(result).toEqual({
    page: 'create-sms-template',
    validationError: null,
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });
});

test('returns error on invalid create-nhs-app-template-back form', () => {
  const result = mainServerAction(
    formState,
    getMockFormData({
      'form-id': 'create-nhs-app-template-back',
      nhsAppTemplateName: 'template-name',
    })
  );

  expect(result).toEqual({
    page: 'choose-template',
    validationError: {
      formErrors: [],
      fieldErrors: {
        nhsAppTemplateMessage: ['Internal server error'],
      },
    },
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });
});

test('returns success on valid create-nhs-app-template-back form', () => {
  const result = mainServerAction(
    formState,
    getMockFormData({
      'form-id': 'create-nhs-app-template-back',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    })
  );

  expect(result).toEqual({
    page: 'choose-template',
    validationError: null,
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  });
});

test('returns error on invalid create-nhs-app-template form', () => {
  const result = mainServerAction(
    formState,
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: '',
    })
  );

  expect(result).toEqual({
    page: 'choose-template',
    validationError: {
      formErrors: [],
      fieldErrors: {
        nhsAppTemplateMessage: ['Enter a template message'],
      },
    },
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });
});

test('returns success on valid create-nhs-app-template form', () => {
  const result = mainServerAction(
    formState,
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    })
  );

  expect(result).toEqual({
    page: 'review-nhs-app-template',
    validationError: null,
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  });
});
