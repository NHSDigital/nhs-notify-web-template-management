import { chooseTemplateTypeAction } from '@forms/ChooseTemplateType/server-action';
import { getMockFormData } from '@testhelpers/helpers';
import { redirect, RedirectType } from 'next/navigation';

jest.mock('next/navigation');

jest.mock('@utils/amplify-utils');

test('submit form - validation error', async () => {
  const response = await chooseTemplateTypeAction(
    {},
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      templateType: 'lemons',
    })
  );

  expect(response).toEqual({
    errorState: {
      formErrors: [],
      fieldErrors: {
        templateType: ['Select a template type'],
      },
    },
  });
});

test.each([
  ['NHS_APP', '/create-nhs-app-template'],
  ['SMS', '/create-text-message-template'],
  ['EMAIL', '/create-email-template'],
  ['LETTER', '/upload-letter-template'],
])(
  'submit form - $templateType redirects to $url',
  async (templateType, url) => {
    const mockRedirect = jest.mocked(redirect);

    await chooseTemplateTypeAction(
      {},
      getMockFormData({
        templateType,
      })
    );

    expect(mockRedirect).toHaveBeenCalledWith(url, RedirectType.push);
  }
);
