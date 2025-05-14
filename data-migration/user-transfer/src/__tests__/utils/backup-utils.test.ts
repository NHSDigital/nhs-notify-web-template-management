import { backupData } from '@/src/utils/backup-utils';
import * as fileSystem from 'node:fs';

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

jest.mock('node:fs', () => ({
  __esModule: true,
  ...jest.requireActual('node:fs'),
}));

const writeFileSyncSpy = jest.spyOn(fileSystem, 'writeFileSync');
const existsSyncSpy = jest.spyOn(fileSystem, 'existsSync');
const mkdirSyncSpy = jest.spyOn(fileSystem, 'mkdirSync');

describe('backup-utils', () => {
  describe('backupData', () => {
    test('should backup data', () => {
      // arrange
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-05-13'));

      writeFileSyncSpy.mockImplementation(() => {});
      existsSyncSpy.mockImplementation(() => false);
      mkdirSyncSpy.mockImplementation(() => '');

      const testParameters = {
        destinationOwner: 'def-456',
        environment: 'testenv',
        sourceOwner: 'abc-123',
      };

      const mockItems = [mockItem1, mockItem2];
      const expectedBackupFilePath =
        './backups/usr_tsfr-2025-05-13T00:00:00.000Z-env-testenv-src-abc-123-dest-def-456.json';

      // act
      backupData(mockItems, testParameters);

      // assert
      expect(mkdirSyncSpy).toHaveBeenCalledWith('./backups');
      expect(writeFileSyncSpy).toHaveBeenCalledWith(
        expectedBackupFilePath,
        JSON.stringify(mockItems)
      );
    });

    test('should handle existing backup dir', () => {
      // arrange
      writeFileSyncSpy.mockImplementation(() => {});
      existsSyncSpy.mockImplementation(() => true);
      mkdirSyncSpy.mockImplementation(() => '');

      const testParameters = {
        destinationOwner: 'def-456',
        environment: 'testenv',
        sourceOwner: 'abc-123',
      };

      // act
      backupData([], testParameters);

      // assert
      expect(mkdirSyncSpy).not.toHaveBeenCalled();
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
