/**
 * @jest-environment node
 */

import { mockDeep } from 'jest-mock-extended';
import {
  handleForm as nhsAppHandleForm,
  handleFormBack as nhsAppHandleFormBack,
} from '@forms/ReviewNHSAppTemplate/server-actions';
import { TemplateFormState, TemplateType } from '../../../utils/types';
import { mainServerAction } from '../../../app/create-template/main-server-action';
import { getMockFormData } from '../../helpers';

const mockFormActions = {
  saveSession: () => {},
};

jest.mock('@forms/ReviewNHSAppTemplate/server-actions');
jest.mock('@utils/form-actions', () => ({
  saveSession: () => mockFormActions.saveSession(),
}));

const formState: TemplateFormState = {
  sessionId: 'session-id',
  page: 'choose-template',
  validationError: undefined,
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

type TestConfig = [string, Record<string, string>, TemplateFormState];

beforeEach(() => {
  mockFormActions.saveSession = jest.fn();
});

test.each<TestConfig>([
  [
    'returns validation error on missing form id',
    {},
    {
      sessionId: 'session-id',
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          formId: ['Internal server error'],
        },
      },
      templateType: TemplateType.NHS_APP,
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
      sessionId: 'session-id',
      page: 'choose-template',
      validationError: {
        formErrors: ['Internal server error'],
        fieldErrors: {},
      },
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns error on invalid choose-template form',
    {
      'form-id': 'choose-template',
      templateType: 'wrong-page',
    },
    {
      sessionId: 'session-id',
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          templateType: ['Select a template type'],
        },
      },
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
  ],
  [
    'returns success on valid choose-template form',
    {
      'form-id': 'choose-template',
      templateType: 'SMS',
    },
    {
      sessionId: 'session-id',
      page: 'create-sms-template',
      validationError: undefined,
      templateType: TemplateType.SMS,
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
      sessionId: 'session-id',
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['Internal server error'],
        },
      },
      templateType: TemplateType.NHS_APP,
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
      sessionId: 'session-id',
      page: 'choose-template',
      validationError: undefined,
      templateType: TemplateType.NHS_APP,
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
      sessionId: 'session-id',
      page: 'choose-template',
      validationError: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['Enter a template message'],
        },
      },
      templateType: TemplateType.NHS_APP,
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
      sessionId: 'session-id',
      page: 'review-nhs-app-template',
      validationError: undefined,
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    },
  ],
])('%s', async (_, formData, expectedFormState) => {
  const result = await mainServerAction(formState, getMockFormData(formData));

  expect(result).toEqual(expectedFormState);
});

it.each([
  { id: 'review-nhs-app-template', handler: nhsAppHandleForm },
  { id: 'review-nhs-app-template-back', handler: nhsAppHandleFormBack },
])('should call %s form handler', async ({ id, handler }) => {
  const formData = {
    'form-id': id,
  };

  jest.mocked(handler).mockReturnValue(
    mockDeep<ReturnType<typeof handler>>({
      validationError: undefined,
    })
  );

  await mainServerAction(formState, getMockFormData(formData));

  expect(handler).toHaveBeenCalled();
  expect(mockFormActions.saveSession).toHaveBeenCalled();
});
