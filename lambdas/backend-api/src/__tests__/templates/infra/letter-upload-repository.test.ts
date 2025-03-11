import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { LetterUploadRepository } from '@backend-api/templates/infra/letter-upload-repository';
import type { Logger } from '@backend-api/utils/logger';
import 'aws-sdk-client-mock-jest';
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

  const pdfBytes = new Blob(['pdf_data']);
  const csvBytes = new Blob(['csv_data']);
  const pdfFilename = 'template.pdf';
  const csvFilename = 'test-data.csv';

  const pdf = new File([pdfBytes], pdfFilename, {
    type: 'application/pdf',
  });
  const csv = new File([csvBytes], csvFilename, {
    type: 'text/csv',
  });

  test('uploads both PDF template and test data CSV', async () => {
    const { letterUploadRepository, mocks } = setup();

    await letterUploadRepository.upload(templateId, owner, versionId, pdf, csv);

    expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);

    expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: quarantineBucketName,
      Key: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
      Body: new Uint8Array(await pdfBytes.arrayBuffer()),
      Metadata: {
        owner,
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
        'template-id': templateId,
        'user-filename': csvFilename,
        'version-id': versionId,
      },
    });
  });

  test('uploads both PDF template when test data CSV is not present', async () => {
    const { letterUploadRepository, mocks } = setup();
    await letterUploadRepository.upload(templateId, owner, versionId, pdf);

    expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 1);

    expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: quarantineBucketName,
      Key: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
      Body: new Uint8Array(await pdfBytes.arrayBuffer()),
      Metadata: {
        owner,
        'template-id': templateId,
        'user-filename': pdfFilename,
        'version-id': versionId,
      },
    });
  });

  test('returns errors when upload fails', async () => {
    const { letterUploadRepository, mocks } = setup();

    mocks.s3Client.on(PutObjectCommand).rejects('could not upload');

    const result = await letterUploadRepository.upload(
      templateId,
      owner,
      versionId,
      pdf,
      csv
    );

    expect(result).toEqual({
      error: {
        actualError: expect.objectContaining({
          message: 'Failed to upload letter files',
          cause: [
            expect.objectContaining({ message: 'could not upload' }),
            expect.objectContaining({ message: 'could not upload' }),
          ],
        }),
        code: 500,
        details: undefined,
        message: 'Failed to upload letter files',
      },
    });

    expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);
  });
});
