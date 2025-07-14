import { chooseTemplateAction } from '@forms/ChooseTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect, RedirectType } from 'next/navigation';

jest.mock('next/navigation');

jest.mock('@utils/amplify-utils');

beforeEach(() => {
  jest.resetAllMocks();
});

test('submit form - validation error', async () => {
  const response = await chooseTemplateAction(
    {},
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      templateType: 'lemons',
    })
  );

  expect(response).toEqual({
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
    {},
    getMockFormData({
      templateType: 'NHS_APP',
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/create-nhs-app-template',
    RedirectType.push
  );
});
