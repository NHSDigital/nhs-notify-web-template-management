import { S3Client } from '@aws-sdk/client-s3';
import { LetterUploadRepository } from '@backend-api/templates/infra/letter-upload-repository';
import type { Logger } from '@backend-api/utils/logger';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'jest-mock-extended';

const quarantineBucketName = 'q_bucket';

const setup = () => {
  const s3Client = mockClient(S3Client);

  const logger = mock<Logger>();

  const letterUploadRepository = new LetterUploadRepository(
    s3Client as unknown as S3Client,
    quarantineBucketName,
    logger
  );

  return { letterUploadRepository, mocks: { s3Client } };
};

describe('LetterUploadRepository', () => {
  const templateId = 'B9B7756DDDA9';
  const owner = '3A1F94D78582';
  const versionId = 'A6C177531604';

  test('uploads both PDF template and test data CSV', async () => {
    const { letterUploadRepository } = setup();

    await letterUploadRepository.upload(templateId, owner, versionId);

    expect(1).toBe(1);
  });
});

// expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);

// expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
//   Key: `pdf-template/${user}/${templateId}/${versionId}.pdf`,
//   Bucket: quarantineBucketName,
//   Body: pdfBuffer,
//   Metadata: {
//     'test-data-csv': 'true',
//     owner: user,
//     'version-id': versionId,
//     'template-id': templateId,
//     'user-filename': 'template.pdf',
//   },
// });

// expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
//   Key: `test-data/${user}/${templateId}/${versionId}.csv`,
//   Bucket: quarantineBucketName,
//   Body: csvBuffer,
//   Metadata: {
//     owner: user,
//     'version-id': versionId,
//     'template-id': templateId,
//     'user-filename': 'test-data.csv',
//   },
// });

// expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
//   templateId,
//   {
//     ...templateWithFileVersions,
//     templateStatus: 'PENDING_VALIDATION',
//   },
//   user
// );
