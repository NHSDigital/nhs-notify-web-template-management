/**
 * @jest-environment node
 */

import { mockDeep } from 'jest-mock-extended';
import CreateTemplate from '@/src/app/create-template/page';
import { redirect } from 'next/navigation';
import { createSession } from '@/src/utils/form-actions';

jest.mock('@/src/utils/form-actions');
jest.mock('next/navigation');

test('CreateTemplate', async () => {
  jest.mocked(createSession).mockResolvedValue({
    id: 'session-id',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
    createdAt: 'created-at',
    updatedAt: 'updated-at',
  });

  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  await CreateTemplate();

  expect(mockRedirect).toHaveBeenCalledWith('/create-template/session-id');
});

test('CreateTemplate - error', async () => {
  jest.mocked(createSession).mockResolvedValue({
    id: undefined as unknown as string,
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
    createdAt: 'created-at',
    updatedAt: 'updated-at',
  });

  await expect(CreateTemplate()).rejects.toThrow('Error creating session');
});
