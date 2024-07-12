import {
  handleForm as nhsAppHandleForm,
  handleFormBack as nhsAppHandleFormBack,
} from '@forms/ReviewNHSAppTemplate/server-actions';
import { FormState } from '../../utils/types';
import { mainServerAction } from '../../app/create-template/main-server-action';
import { getMockFormData } from '../helpers';

jest.mock('@forms/ReviewNHSAppTemplate/server-actions');

const formState: FormState = {
  page: 'choose-template',
  validationError: undefined,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

type TestConfig = [string, Record<string, string>, FormState];

test.each<TestConfig>([
  [
    'returns validation error on missing form id',
    {},
    {
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          formId: ['Internal server error'],
        },
      },
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns validation error on missing server action',
    {
      'form-id': 'create-sms-template',
    },
    {
      page: 'choose-template',
      validationError: {
        formErrors: ['Internal server error'],
        fieldErrors: {},
      },
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns error on invalid choose-template form',
    {
      'form-id': 'choose-template',
      page: 'wrong-page',
    },
    {
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          page: ['Select a template type'],
        },
      },
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns success on valid choose-template form',
    {
      'form-id': 'choose-template',
      page: 'create-sms-template',
    },
    {
      page: 'create-sms-template',
      validationError: undefined,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns error on invalid create-nhs-app-template-back form',
    {
      'form-id': 'create-nhs-app-template-back',
      nhsAppTemplateName: 'template-name',
    },
    {
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['Internal server error'],
        },
      },
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns success on valid create-nhs-app-template-back form',
    {
      'form-id': 'create-nhs-app-template-back',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    },
    {
      page: 'choose-template',
      validationError: undefined,
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    },
  ],
  [
    'returns error on invalid create-nhs-app-template form',
    {
      'form-id': 'create-nhs-app-template',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: '',
    },
    {
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['Enter a template message'],
        },
      },
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns success on valid create-nhs-app-template form',
    {
      'form-id': 'create-nhs-app-template',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    },
    {
      page: 'review-nhs-app-template',
      validationError: undefined,
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    },
  ],
])('%s', (_, formData, expectedFormState) => {
  const result = mainServerAction(formState, getMockFormData(formData));

  expect(result).toEqual(expectedFormState);
});

it.each([
  { id: 'review-nhs-app-template', handler: nhsAppHandleForm },
  { id: 'review-nhs-app-template-back', handler: nhsAppHandleFormBack },
])('should call %s form handler', ({ id, handler }) => {
  const formData = {
    'form-id': id,
  };

  mainServerAction(formState, getMockFormData(formData));

  expect(handler).toHaveBeenCalled();
});
