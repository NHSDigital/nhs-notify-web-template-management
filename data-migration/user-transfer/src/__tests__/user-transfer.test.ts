/* eslint-disable unicorn/no-array-for-each */
import { performTransfer } from '@/src/user-transfer';
import { retrieveTemplates, updateItem } from '@/src/utils/ddb-utils';
import { backupData } from '@/src/utils/backup-utils';

const mockItem1 = {
  templateType: {
    S: 'LETTER',
  },
  updatedAt: {
    S: '2000-01-01T00:00:00.000Z',
  },
  owner: {
    S: 'abc-123',
  },
  id: {
    S: 'item-1',
  },
};

const mockItem2 = {
  templateType: {
    S: 'EMAIL',
  },
  updatedAt: {
    S: '2000-01-01T00:00:00.000Z',
  },
  owner: {
    S: 'abc-123',
  },
  id: {
    S: 'item-2',
  },
};

jest.mock('@/src/utils/backup-utils');
jest.mock('@/src/utils/ddb-utils');

const mockArguments = [
  '--sourceOwner',
  'abc-123',
  '--destinationOwner',
  'def-456',
  '--environment',
  'testenv',
];

describe('user-transfer', () => {
  const OLD_ENV = { ...process.argv };
  afterAll(() => {
    process.argv = OLD_ENV;
  });

  test('should backup and update templates', async () => {
    // arrange
    mockArguments.forEach((item) => process.argv.push(item));
    const mockItems = [mockItem1, mockItem2];
    const expectedParameters = {
      destinationOwner: 'def-456',
      environment: 'testenv',
      sourceOwner: 'abc-123',
    };

    const mockRetrieveTemplates = jest.mocked(retrieveTemplates);
    const mockUpdateItem = jest.mocked(updateItem);
    const mockBackupData = jest.mocked(backupData);

    mockRetrieveTemplates.mockImplementation(async () => mockItems);

    // act
    await performTransfer();

    // assert
    expect(mockBackupData).toHaveBeenCalledWith(
      mockItems,
      expect.objectContaining(expectedParameters)
    );
    expect(mockUpdateItem).toHaveBeenCalledTimes(2);
    expect(mockUpdateItem).toHaveBeenCalledWith(
      mockItem1,
      expect.objectContaining(expectedParameters)
    );
    expect(mockUpdateItem).toHaveBeenCalledWith(
      mockItem2,
      expect.objectContaining(expectedParameters)
    );
  });
});
