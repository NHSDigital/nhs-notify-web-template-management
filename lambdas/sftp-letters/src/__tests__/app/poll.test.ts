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
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0':
          directoryType,
        'download-dir/sftp-environment/proofs/unexpected-id-format':
          directoryType,
      };

      return existsMappings[path] ?? false;
    },
    get: async (path: string) => {
      if (
        path ===
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0/download-error.pdf'
      ) {
        throw downloadError;
      }

      const buffer = {
        'download-dir/sftp-environment/proofs/client2_campaign2_template-3_zh_x1':
          mockPdfBuffer,
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0/proof-1.pdf':
          mockPdfBuffer,
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0/proof-2.pdf':
          mockPdfBuffer,
        'download-dir/sftp-environment/proofs/unexpected-id-format/proof-1.pdf':
          mockPdfBuffer,
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0/invalid-file.pdf':
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
            name: 'client_campaign_template-1_en_x0',
            type: directoryType,
            modifyTime: Date.now(),
          },
          {
            name: 'file-to-ignore.pdf',
            type: fileType,
            modifyTime: Date.now(),
          },
          {
            name: 'client3_campaign3_template-5_de_q1',
            type: directoryType,
            modifyTime: Date.now(),
          },
        ],
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0':
          [
            {
              name: 'proof-1.pdf',
              type: fileType,
              modifyTime: Date.now(),
            },
            {
              name: 'proof-2.pdf',
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
        'download-dir/sftp-environment/proofs/unexpected-id-format': [
          {
            name: 'proof-1.pdf',
            type: fileType,
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
    'proofs/supplier/template-1/proof-1.pdf',
    {
      ChecksumAlgorithm: 'SHA256',
    }
  );
  expect(s3Repository.putRawData).toHaveBeenCalledWith(
    mockPdfBuffer,
    'proofs/supplier/template-1/proof-2.pdf',
    {
      ChecksumAlgorithm: 'SHA256',
    }
  );

  expect(mockLogger.logMessages).toContainEqual(
    expect.objectContaining({
      level: 'error',
      message: 'PDF file failed validation',
      sftpPath:
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0/invalid-file.pdf',
      s3Path: 'proofs/supplier/template-1/invalid-file.pdf',
      timestamp: new Date('2022-01-01 09:00').toISOString(),
    })
  );
  expect(mockLogger.logMessages).toContainEqual(
    expect.objectContaining({
      level: 'error',
      sftpPath:
        'download-dir/sftp-environment/proofs/client_campaign_template-1_en_x0/download-error.pdf',
      s3Path: 'proofs/supplier/template-1/download-error.pdf',
      timestamp: new Date('2022-01-01 09:00').toISOString(),
      stack: expect.stringContaining('Error: Download error'),
      message: 'Failed to process file Download error',
    })
  );

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

  expect(mockLogger.logMessages).toContainEqual(
    expect.objectContaining({
      level: 'info',
      baseSftpPath: 'download-dir/sftp-environment/proofs',
      message: 'Base SFTP path does not exist',
      timestamp: new Date('2022-01-01 09:00').toISOString(),
    })
  );

  expect(sftpClient.connect).toHaveBeenCalledTimes(1);
  expect(sftpClient.end).toHaveBeenCalledTimes(1);
});
