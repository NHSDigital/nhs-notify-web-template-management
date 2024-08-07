import { redirect } from 'next/navigation';
import { chooseTemplateAction } from '@forms/ChooseTemplate/server-action';
import { getMockFormData } from '@/src/__tests__/helpers';
import { TemplateType } from '@/src/utils/types';

jest.mock('next/navigation');

jest.mock('@/src/utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      SessionStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));

test('submit form - validation error', async () => {
  const mockRedirect = jest.mocked(redirect);

  const response = await chooseTemplateAction(
    {
      id: 'session-id',
      templateType: 'UNKNOWN',
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      templateType: 'lemons',
    })
  );

  expect(mockRedirect).not.toHaveBeenCalled();

  expect(response).toEqual({
    id: 'session-id',
    templateType: 'UNKNOWN',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
    validationError: {
      formErrors: [],
      fieldErrors: {
        templateType: ['Select a template type'],
      },
    },
  });
});

test('submit form - no validation error', async () => {
  const mockRedirect = jest.mocked(redirect);

  await chooseTemplateAction(
    {
      id: 'session-id',
      templateType: 'UNKNOWN',
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
    getMockFormData({
      templateType: TemplateType.NHS_APP,
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/create-nhs-app-template/session-id'
  );
});
