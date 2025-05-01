import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { LetterFileRepository } from '@backend-api/templates/infra/letter-file-repository';

const setup = () => {
  const s3Client = mockClient(S3Client);

  const letterFileRepository = new LetterFileRepository(
    'quarantine-bucket',
    'internal-bucket'
  );

  return { letterFileRepository, mocks: { s3Client } };
};

describe('LetterUploadRepository', () => {
  describe('copyFromQuarantineToInternal', () => {
    it('copies pdf template files from quarantine to internal', async () => {
      const { letterFileRepository, mocks } = setup();

      await letterFileRepository.copyFromQuarantineToInternal(
        's3/object/key',
        's3-object-version'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(CopyObjectCommand, {
        Bucket: 'internal-bucket',
        CopySource:
          '/quarantine-bucket/s3/object/key?versionId=s3-object-version',
        Key: 's3/object/key',
        MetadataDirective: 'COPY',
        TaggingDirective: 'COPY',
      });
    });
  });

  describe('deleteFromQuarantine', () => {
    it('deletes files from quarantine', async () => {
      const { letterFileRepository, mocks } = setup();

      await letterFileRepository.deleteFromQuarantine('key', 'version');

      expect(mocks.s3Client).toHaveReceivedCommandWith(DeleteObjectCommand, {
        Bucket: 'quarantine-bucket',
        Key: 'key',
        VersionId: 'version',
      });
    });
  });
});
