import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { LetterUploadRepository } from '../../../templates/infra/letter-upload-repository';

const quarantineBucketName = 'quarantine-bucket';
const internalBucketName = 'internal-bucket';

const setup = () => {
  const s3Client = mockClient(S3Client);

  const letterUploadRepository = new LetterUploadRepository(
    quarantineBucketName,
    internalBucketName
  );

  return { letterUploadRepository, mocks: { s3Client } };
};

describe('LetterUploadRepository', () => {
  const templateId = 'B9B7756DDDA9';
  const owner = '3A1F94D78582';
  const versionId = 'A6C177531604';

  const pdfBytes = new Blob(['pdf_data']);
  const csvBytes = new Blob(['csv_data']);
  const pdfFilename = 'template.pdf';
  const csvFilename = 'test-data.csv';

  describe('upload', () => {
    const pdf = new File([pdfBytes], pdfFilename, {
      type: 'application/pdf',
    });
    const csv = new File([csvBytes], csvFilename, {
      type: 'text/csv',
    });

    test('uploads both PDF template and test data CSV', async () => {
      const { letterUploadRepository, mocks } = setup();

      await letterUploadRepository.upload(
        templateId,
        owner,
        versionId,
        pdf,
        csv
      );

      expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);

      expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: quarantineBucketName,
        Key: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        Body: new Uint8Array(await pdfBytes.arrayBuffer()),
        Metadata: {
          owner,
          'file-type': 'pdf-template',
          'template-id': templateId,
          'user-filename': pdfFilename,
          'version-id': versionId,
          'test-data-provided': 'true',
        },
      });

      expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: quarantineBucketName,
        Key: `test-data/${owner}/${templateId}/${versionId}.csv`,
        Body: new Uint8Array(await csvBytes.arrayBuffer()),
        Metadata: {
          owner,
          'file-type': 'test-data',
          'template-id': templateId,
          'user-filename': csvFilename,
          'version-id': versionId,
        },
      });
    });

    test('uploads only the PDF template when test data CSV is not present', async () => {
      const { letterUploadRepository, mocks } = setup();
      await letterUploadRepository.upload(templateId, owner, versionId, pdf);

      expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 1);

      expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: quarantineBucketName,
        Key: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        Body: new Uint8Array(await pdfBytes.arrayBuffer()),
        Metadata: {
          owner,
          'file-type': 'pdf-template',
          'template-id': templateId,
          'user-filename': pdfFilename,
          'version-id': versionId,
          'test-data-provided': 'false',
        },
      });
    });

    test('returns error when upload fails', async () => {
      const { letterUploadRepository, mocks } = setup();

      const err = new Error('could not upload');

      mocks.s3Client.on(PutObjectCommand).rejects(err);

      const result = await letterUploadRepository.upload(
        templateId,
        owner,
        versionId,
        pdf,
        csv
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          code: 500,
          details: undefined,
          message: 'Failed to upload letter files',
        },
      });

      expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);
    });
  });

  describe('getFileMetadata', () => {
    it('fetches pdf-template type file metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'pdf-template',
        owner: 'template-owner',
        'template-id': 'template-id',
        'test-data-provided': 'true',
        'user-filename': 'template.pdf',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      const result = await letterUploadRepository.getFileMetadata(
        'quarantine-bucket',
        'test/object/key',
        's3-object-version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(HeadObjectCommand, {
        Bucket: 'quarantine-bucket',
        Key: 'test/object/key',
        VersionId: 's3-object-version',
      });

      expect(result).toEqual(metadata);
    });

    it('fetches pdf-template type file metadata with test-data-provided as false', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'pdf-template',
        owner: 'template-owner',
        'template-id': 'template-id',
        'test-data-provided': 'false',
        'user-filename': 'template.pdf',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      const result = await letterUploadRepository.getFileMetadata(
        'quarantine-bucket',
        'test/object/key',
        's3-object-version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(HeadObjectCommand, {
        Bucket: 'quarantine-bucket',
        Key: 'test/object/key',
        VersionId: 's3-object-version',
      });

      expect(result).toEqual(metadata);
    });

    it('fetches test-data type file metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'test-data',
        owner: 'template-owner',
        'template-id': 'template-id',
        'user-filename': 'data.csv',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      const result = await letterUploadRepository.getFileMetadata(
        'quarantine-bucket',
        'test/object/key',
        's3-object-version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(HeadObjectCommand, {
        Bucket: 'quarantine-bucket',
        Key: 'test/object/key',
        VersionId: 's3-object-version',
      });

      expect(result).toEqual(metadata);
    });

    it('errors if file type is missing in returned metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        owner: 'template-owner',
        'template-id': 'template-id',
        'user-filename': 'data.csv',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      await expect(
        letterUploadRepository.getFileMetadata(
          'quarantine-bucket',
          'test/object/key',
          's3-object-version'
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if file type is invalid in returned metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'unknown',
        owner: 'template-owner',
        'template-id': 'template-id',
        'user-filename': 'data.csv',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      await expect(
        letterUploadRepository.getFileMetadata(
          'quarantine-bucket',
          'test/object/key',
          's3-object-version'
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if owner is missing in returned metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'test-data',
        'template-id': 'template-id',
        'user-filename': 'data.csv',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      await expect(
        letterUploadRepository.getFileMetadata(
          'quarantine-bucket',
          'test/object/key',
          's3-object-version'
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if template-id is missing in returned metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'test-data',
        owner: 'template-owner',
        'user-filename': 'data.csv',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      await expect(
        letterUploadRepository.getFileMetadata(
          'quarantine-bucket',
          'test/object/key',
          's3-object-version'
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if test-data-provided value is invalid in returned metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'test-data',
        owner: 'template-owner',
        'template-id': 'template-id',
        'test-data-provided': 'unknown',
        'user-filename': 'data.csv',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      await expect(
        letterUploadRepository.getFileMetadata(
          'quarantine-bucket',
          'test/object/key',
          's3-object-version'
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if user-filename is missing in returned metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'test-data',
        owner: 'template-owner',
        'template-id': 'template-id',
        'test-data-provided': 'unknown',
        'version-id': 'template-version',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      await expect(
        letterUploadRepository.getFileMetadata(
          'quarantine-bucket',
          'test/object/key',
          's3-object-version'
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if version-id is missing in returned metadata', async () => {
      const { letterUploadRepository, mocks } = setup();

      const metadata = {
        'file-type': 'test-data',
        owner: 'template-owner',
        'template-id': 'template-id',
        'test-data-provided': 'unknown',
        'user-filename': 'data.csv',
      };

      mocks.s3Client.on(HeadObjectCommand).resolves({
        Metadata: metadata,
      });

      await expect(
        letterUploadRepository.getFileMetadata(
          'quarantine-bucket',
          'test/object/key',
          's3-object-version'
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('copyFromQuarantineToInternal', () => {
    it('copies pdf template files from quarantine to internal', async () => {
      const { letterUploadRepository, mocks } = setup();

      await letterUploadRepository.copyFromQuarantineToInternal(
        { owner: 'owner', id: 'template' },
        'pdf-template',
        'version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(CopyObjectCommand, {
        Bucket: 'internal-bucket',
        CopySource:
          '/quarantine-bucket/pdf-template/owner/template/version.pdf',
        Key: 'pdf-template/owner/template/version.pdf',
        MetadataDirective: 'COPY',
        TaggingDirective: 'COPY',
      });
    });

    it('copies test data files from quarantine to internal', async () => {
      const { letterUploadRepository, mocks } = setup();

      await letterUploadRepository.copyFromQuarantineToInternal(
        { owner: 'owner', id: 'template' },
        'test-data',
        'version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(CopyObjectCommand, {
        Bucket: 'internal-bucket',
        CopySource: '/quarantine-bucket/test-data/owner/template/version.csv',
        Key: 'test-data/owner/template/version.csv',
        MetadataDirective: 'COPY',
        TaggingDirective: 'COPY',
      });
    });
  });

  describe('deleteFromQuarantine', () => {
    it('deletes pdf template files from quarantine', async () => {
      const { letterUploadRepository, mocks } = setup();

      await letterUploadRepository.deleteFromQuarantine(
        { owner: 'owner', id: 'template' },
        'pdf-template',
        'version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(DeleteObjectCommand, {
        Bucket: 'quarantine-bucket',
        Key: 'pdf-template/owner/template/version.pdf',
      });
    });

    it('deletes test data files from quarantine', async () => {
      const { letterUploadRepository, mocks } = setup();

      await letterUploadRepository.deleteFromQuarantine(
        { owner: 'owner', id: 'template' },
        'test-data',
        'version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(DeleteObjectCommand, {
        Bucket: 'quarantine-bucket',
        Key: 'test-data/owner/template/version.csv',
      });
    });
  });
});
