import { chooseTemplateAction } from '@forms/ChooseTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { TemplateFormState, TemplateType } from '@utils/types';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      SessionStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));

const initialState: TemplateFormState = {
  id: 'session-id',
  templateType: 'UNKNOWN',
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

test('submit form - validation error', async () => {
  const response = await chooseTemplateAction(
    initialState,
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      templateType: 'lemons',
    })
  );

  expect(response).toEqual({
    ...initialState,
    validationError: {
      formErrors: [],
      fieldErrors: {
        templateType: ['Select a template type'],
      },
    },
  });
});

test('submit form - no validation error', async () => {
  const response = await chooseTemplateAction(
    initialState,
    getMockFormData({
      templateType: TemplateType.NHS_APP,
    })
  );

  expect(response).toEqual({
    ...initialState,
    templateType: TemplateType.NHS_APP,
    redirect: '/create-nhs-app-template/session-id',
  });
});
