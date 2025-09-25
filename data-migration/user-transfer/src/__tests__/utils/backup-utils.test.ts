import { backupData } from '@/src/utils/backup-utils';
import { getAccountId } from '@/src/utils/sts-utils';
import { writeFile } from '@/src/utils/s3-utils';

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

jest.mock('@/src/utils/sts-utils');
jest.mock('@/src/utils/s3-utils');

describe('backup-utils', () => {
  describe('backupData', () => {
    test('should backup data', async () => {
      // arrange
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-05-13'));

      jest
        .mocked(getAccountId)
        .mockImplementation(() => Promise.resolve('000000000000'));
      const mockedWriteJsonToFile = jest.mocked(writeFile);

      const testParameters = {
        destinationOwner: 'def-456',
        environment: 'testenv',
        sourceOwner: 'abc-123',
      };

      const mockItems = [mockItem1, mockItem2];
      const expectedBackupFilePath =
        'user-transfer/testenv/2025_05_13_00_00_00_000Z-source-abc-123-destination-def-456.json';
      const expectedBucketName =
        'nhs-notify-000000000000-eu-west-2-main-acct-migration-backup';
      const expectedContent = JSON.stringify(mockItems);

      // act
      await backupData(mockItems, testParameters);

      // assert
      expect(mockedWriteJsonToFile).toHaveBeenCalledWith(
        expectedBackupFilePath,
        expectedContent,
        expectedBucketName
      );
    });

    test('should no-op the backup when no items have been found', async () => {
      // arrange
      const mockedWriteJsonToFile = jest.mocked(writeFile);

      const testParameters = {
        destinationOwner: 'def-456',
        environment: 'testenv',
        sourceOwner: 'abc-123',
      };

      // act
      await backupData([], testParameters);

      // assert
      expect(mockedWriteJsonToFile).not.toHaveBeenCalled();
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
