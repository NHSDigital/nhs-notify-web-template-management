import { chooseMessageOrderAction } from '@forms/ChooseMessageOrder/server-action';
import { getMockFormData } from '@testhelpers/helpers';
import { redirect, RedirectType } from 'next/navigation';

jest.mock('next/navigation');

jest.mock('@utils/amplify-utils');

test('submit form - validation error', async () => {
  const response = await chooseMessageOrderAction(
    {},
    getMockFormData({
      'form-id': 'create-message-order',
      messageOrder: 'lemons',
    })
  );

  expect(response).toEqual({
    errorState: {
      formErrors: [],
      fieldErrors: {
        messageOrder: ['Select a message order'],
      },
    },
  });
});

test.each([
  {
    option: 'NHSAPP',
    label: 'NHS App only',
  },
  {
    option: 'NHSAPP,EMAIL',
    label: 'NHS App, Email',
  },
  {
    option: 'NHSAPP,SMS',
    label: 'NHS App, Text message',
  },
  {
    option: 'NHSAPP,EMAIL,SMS',
    label: 'NHS App, Email, Text message',
  },
  {
    option: 'NHSAPP,SMS,EMAIL',
    label: 'NHS App, Text message, Email',
  },
  {
    option: 'NHSAPP,SMS,LETTER',
    label: 'NHS App, Text message, Letter',
  },
  {
    option: 'NHSAPP,EMAIL,SMS,LETTER',
    label: 'NHS App, Email, Text message, Letter',
  },
  {
    option: 'EMAIL',
    label: 'Email only',
  },
  {
    option: 'LETTER',
    label: 'Letter only',
  },
])("submit form - '$label' redirects to $path", async ({ option }) => {
  const mockRedirect = jest.mocked(redirect);

  await chooseMessageOrderAction(
    {},
    getMockFormData({
      messageOrder: option,
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    `/message-plans/create-message-plan?messageOrder=${encodeURIComponent(option)}`,
    RedirectType.push
  );
});
