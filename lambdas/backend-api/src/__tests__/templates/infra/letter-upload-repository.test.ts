import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { LetterUploadRepository } from '@backend-api/templates/infra/letter-upload-repository';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';

const quarantineBucketName = 'q_bucket';

const setup = () => {
  const s3Client = mockClient(S3Client);

  const letterUploadRepository = new LetterUploadRepository(
    s3Client as unknown as S3Client,
    quarantineBucketName
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
