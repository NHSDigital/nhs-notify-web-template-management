import { mockDeep } from 'jest-mock-extended';
import { redirect } from 'next/navigation';
import CreateTemplate from '@app/create-template/page';

const mockTemplate = {
  id: undefined as unknown,
  createdAt: 'created-at',
  updatedAt: 'updated-at',
};

jest.mock('@utils/form-actions', () => ({
  createTemplate: () => mockTemplate,
}));
jest.mock('next/navigation');

test('CreateTemplate', async () => {
  mockTemplate.id = 'template-id';

  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  await CreateTemplate();

  expect(mockRedirect).toHaveBeenCalledWith(
    '/choose-a-template-type/template-id',
    'replace'
  );
});

test('CreateTemplate - error', async () => {
  mockTemplate.id = undefined;

  await expect(CreateTemplate()).rejects.toThrow('Error creating template');
});
