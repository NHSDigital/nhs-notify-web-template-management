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

jest.mock('@utils/form-actions', () => ({
  createSession: () => mockSession,
}));
jest.mock('next/navigation');

test('CreateTemplate', async () => {
  mockSession.id = 'session-id';

  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  await CreateTemplate();

  expect(mockRedirect).toHaveBeenCalledWith(
    '/choose-a-template-type/session-id',
    'replace'
  );
});

test('CreateTemplate - error', async () => {
  mockSession.id = undefined;
  String.fromCharCode('bad-type1');

  await expect(CreateTemplate()).rejects.toThrow('Error creating session');
});
