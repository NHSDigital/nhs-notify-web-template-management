import type { FileInfo } from 'ssh2-sftp-client';
import { mockDeep } from 'jest-mock-extended';
import { App } from '../../app/poll';
import { SftpSupplierClientRepository } from '../../infra/sftp-supplier-client-repository';
import { SftpClient } from '../../infra/sftp-client';
import { S3Repository } from 'nhs-notify-web-template-management-utils';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';

const mockPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46]);
const mockMalformedPdfBuffer = Buffer.from([]);
const downloadError = new Error('Download error');

const directoryType: FileInfo['type'] = 'd';
const fileType: FileInfo['type'] = '-';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

test('polls SFTP folder', async () => {
  const sftpClient = mockDeep<SftpClient>({
    exists: async (path: string) => {
      const existsMappings: Record<string, FileInfo['type']> = {
        'download-dir/sftp-environment/proofs': directoryType,
        'download-dir/sftp-environment/proofs/template-1-folder': directoryType,
      };

      return existsMappings[path] ?? false;
    },
    get: async (path: string) => {
      if (
        path ===
        'download-dir/sftp-environment/proofs/template-1-folder/download-error.pdf'
      ) {
        throw downloadError;
      }

      const buffer = {
        'download-dir/sftp-environment/proofs/template-3.pdf': mockPdfBuffer,
        'download-dir/sftp-environment/proofs/template-1-folder/template-1.pdf':
          mockPdfBuffer,
        'download-dir/sftp-environment/proofs/template-1-folder/template-2.pdf':
          mockPdfBuffer,
        'download-dir/sftp-environment/proofs/template-1-folder/invalid-file.pdf':
          mockMalformedPdfBuffer,
      }[path];

      if (!buffer) {
        throw new Error('File not found');
      }

      return buffer;
    },
    list: async (path: string) =>
      ({
        'download-dir/sftp-environment/proofs': [
          {
            name: 'template-1-folder',
            type: directoryType,
            modifyTime: Date.now(),
          },
          {
            name: 'file-to-ignore.pdf',
            type: fileType,
            modifyTime: Date.now(),
          },
          {
            name: 'folder-does-not-exist',
            type: directoryType,
            modifyTime: Date.now(),
          },
        ],
        'download-dir/sftp-environment/proofs/template-1-folder': [
          {
            name: 'template-1.pdf',
            type: fileType,
            modifyTime: Date.now(),
          },
          {
            name: 'template-2.pdf',
            type: fileType,
            modifyTime: Date.now(),
          },
          {
            name: 'invalid-file.pdf',
            type: fileType,
            modifyTime: Date.now(),
          },
          {
            name: 'download-error.pdf',
            type: fileType,
            modifyTime: Date.now(),
          },
          {
            name: 'extra-folder-to-ignore',
            type: directoryType,
            modifyTime: Date.now(),
          },
        ],
      })[path] ?? [],
  });

  const sftpSupplierClientRepository = mockDeep<SftpSupplierClientRepository>({
    getClient: async () => ({
      sftpClient,
      baseUploadDir: 'upload-dir',
      baseDownloadDir: 'download-dir',
      name: 'supplier',
    }),
  });

  const mockLogger = createMockLogger();
  const s3Repository = mockDeep<S3Repository>();

  const app = new App(
    sftpSupplierClientRepository,
    mockLogger.logger,
    s3Repository,
    'sftp-environment'
  );

  await app.poll('supplier');

  expect(s3Repository.putRawData).toHaveBeenCalledTimes(2);
  expect(s3Repository.putRawData).toHaveBeenCalledWith(
    mockPdfBuffer,
    'proofs/template-1-folder/template-1.pdf'
  );
  expect(s3Repository.putRawData).toHaveBeenCalledWith(
    mockPdfBuffer,
    'proofs/template-1-folder/template-2.pdf'
  );

  expect(mockLogger.logMessages).toContainEqual({
    level: 'error',
    message: {
      description: 'PDF file failed validation',
      sftpPath:
        'download-dir/sftp-environment/proofs/template-1-folder/invalid-file.pdf',
      s3Path: 'proofs/template-1-folder/invalid-file.pdf',
    },
    timestamp: new Date('2022-01-01 09:00').toISOString(),
  });
  expect(mockLogger.logMessages).toContainEqual({
    level: 'error',
    description: 'Failed to process file',
    sftpPath:
      'download-dir/sftp-environment/proofs/template-1-folder/download-error.pdf',
    s3Path: 'proofs/template-1-folder/download-error.pdf',
    timestamp: new Date('2022-01-01 09:00').toISOString(),
    stack: expect.stringContaining('Error: Download error'),
    message: 'Download error',
  });

  expect(sftpClient.connect).toHaveBeenCalledTimes(1);
  expect(sftpClient.end).toHaveBeenCalledTimes(1);
});

test('attempts to poll folder that does not exist', async () => {
  const mockSftpList = jest.fn();
  const sftpClient = mockDeep<SftpClient>({
    exists: async () => false as const,
    list: mockSftpList,
  });

  const sftpSupplierClientRepository = mockDeep<SftpSupplierClientRepository>({
    getClient: async () => ({
      sftpClient,
      baseUploadDir: 'upload-dir',
      baseDownloadDir: 'download-dir',
      name: 'supplier',
    }),
  });

  const mockLogger = createMockLogger();
  const s3Repository = mockDeep<S3Repository>();

  const app = new App(
    sftpSupplierClientRepository,
    mockLogger.logger,
    s3Repository,
    'sftp-environment'
  );

  await app.poll('supplier');

  expect(sftpClient.list).not.toHaveBeenCalled();

  expect(mockLogger.logMessages).toContainEqual({
    level: 'info',
    message: "Path 'download-dir/sftp-environment/proofs' does not exist",
    timestamp: new Date('2022-01-01 09:00').toISOString(),
  });

  expect(sftpClient.connect).toHaveBeenCalledTimes(1);
  expect(sftpClient.end).toHaveBeenCalledTimes(1);
});
