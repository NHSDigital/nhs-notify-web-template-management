/**
 * @jest-environment node
 */

import { mockDeep } from 'jest-mock-extended';
import CreateTemplate from '@/src/app/create-template/page';
import { redirect } from 'next/navigation';

const mockSession = {
  id: undefined as unknown,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
  createdAt: 'created-at',
  updatedAt: 'updated-at',
};

jest.mock('@forms/ReviewNHSAppTemplate/server-actions');
jest.mock('@utils/form-actions', () => ({
  createSession: () => mockSession,
}));
jest.mock('next/navigation');

test('CreateTemplate', async () => {
  mockSession.id = 'session-id';

  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  await CreateTemplate();

  expect(mockRedirect).toHaveBeenCalledWith('/create-template/session-id');
});

test('CreateTemplate - error', async () => {
  mockSession.id = undefined;

  await expect(CreateTemplate()).rejects.toThrow('Error creating session');
});
