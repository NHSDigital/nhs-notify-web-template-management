import type { FileInfo } from 'ssh2-sftp-client';
import { mockDeep } from 'jest-mock-extended';
import { App } from '../../app/poll';
import { SftpSupplierClientRepository } from '../../infra/sftp-supplier-client-repository';
import { SftpClient } from '../../infra/sftp-client';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { S3Repository } from 'nhs-notify-web-template-management-utils';

const mockPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46]);
const mockMalformedPdfBuffer = Buffer.from([]);
const downloadError = new Error('Download error');

const directoryType: FileInfo['type'] = 'd';
const fileType: FileInfo['type'] = '-';

test('polls SFTP clients', async () => {
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
            name: 'template-3.pdf',
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
        ],
      })[path] ?? [],
  });

  const sftpSupplierClientRepository = mockDeep<SftpSupplierClientRepository>({
    listClients: async () => [
      {
        sftpClient,
        baseUploadDir: 'upload-dir',
        baseDownloadDir: 'download-dir',
        name: 'supplier',
      },
    ],
  });

  const mockLogger = mockDeep<Logger>();
  const s3Repository = mockDeep<S3Repository>();

  const app = new App(
    sftpSupplierClientRepository,
    mockLogger,
    s3Repository,
    'sftp-environment'
  );

  await app.poll();

  expect(s3Repository.putRawData).toHaveBeenCalledTimes(3);
  expect(s3Repository.putRawData).toHaveBeenCalledWith(
    mockPdfBuffer,
    'proofs/template-1-folder/template-1.pdf'
  );
  expect(s3Repository.putRawData).toHaveBeenCalledWith(
    mockPdfBuffer,
    'proofs/template-1-folder/template-2.pdf'
  );
  expect(s3Repository.putRawData).toHaveBeenCalledWith(
    mockPdfBuffer,
    'proofs/template-3.pdf'
  );

  expect(mockLogger.error).toHaveBeenCalledWith('PDF file failed validation', {
    copyPath:
      'download-dir/sftp-environment/proofs/template-1-folder/invalid-file.pdf',
    pastePath: 'proofs/template-1-folder/invalid-file.pdf',
  });
  expect(mockLogger.error).toHaveBeenCalledWith('Failed to copy file', {
    copyPath:
      'download-dir/sftp-environment/proofs/template-1-folder/download-error.pdf',
    pastePath: 'proofs/template-1-folder/download-error.pdf',
    error: downloadError,
  });

  expect(sftpClient.connect).toHaveBeenCalledTimes(1);
  expect(sftpClient.end).toHaveBeenCalledTimes(1);
});
