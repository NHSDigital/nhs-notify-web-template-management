/**
 * @jest-environment node
 */

import { mockDeep } from 'jest-mock-extended';
import { redirect } from 'next/navigation';
import CreateTemplate from '@app/create-template/page';

const mockSession = {
  id: undefined as unknown,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
  createdAt: 'created-at',
  updatedAt: 'updated-at',
};

jest.mock('@forms/ReviewNHSAppTemplate/server-action');
jest.mock('@utils/form-actions', () => ({
  createSession: () => mockSession,
}));
jest.mock('next/navigation');
jest.mock('@app/create-template/main-server-action', () => ({
  mainServerAction: () => {},
}));

test('CreateTemplate', async () => {
  mockSession.id = 'session-id';

  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  await CreateTemplate();

  expect(mockRedirect).toHaveBeenCalledWith(
    '/choose-a-template-type/session-id'
  );
});

test('CreateTemplate - error', async () => {
  mockSession.id = undefined;

  await expect(CreateTemplate()).rejects.toThrow('Error creating session');
});
