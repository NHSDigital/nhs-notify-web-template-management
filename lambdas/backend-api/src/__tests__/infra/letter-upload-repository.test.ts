import { Blob, File } from 'node:buffer';
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { LetterUploadRepository } from '../../infra/letter-upload-repository';
import { mock } from 'jest-mock-extended';

const quarantineBucketName = 'quarantine-bucket';
const internalBucketName = 'internal-bucket';

const setup = () => {
  const s3Client = mockClient(S3Client);

  const letterUploadRepository = new LetterUploadRepository(
    quarantineBucketName,
    internalBucketName,
    'download-bucket'
  );

  return { letterUploadRepository, mocks: { s3Client } };
};

describe('LetterUploadRepository', () => {
  const templateId = 'B9B7756DDDA9';
  const userId = '3A1F94D78582';
  const clientId = '796894D41AAC';
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
        { userId, clientId },
        versionId,
        pdf,
        csv
      );

      expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);

      expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: quarantineBucketName,
        Key: `pdf-template/${clientId}/${templateId}/${versionId}.pdf`,
        Body: new Uint8Array(await pdfBytes.arrayBuffer()),
        Metadata: {
          'client-id': clientId,
          'file-type': 'pdf-template',
          'template-id': templateId,
          'version-id': versionId,
        },
      });

      expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: quarantineBucketName,
        Key: `test-data/${clientId}/${templateId}/${versionId}.csv`,
        Body: new Uint8Array(await csvBytes.arrayBuffer()),
        Metadata: {
          'client-id': clientId,
          'file-type': 'test-data',
          'template-id': templateId,
          'version-id': versionId,
        },
      });
    });

    test('uploads only the PDF template when test data CSV is not present', async () => {
      const { letterUploadRepository, mocks } = setup();
      await letterUploadRepository.upload(
        templateId,
        { userId, clientId },
        versionId,
        pdf
      );

      expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 1);

      expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: quarantineBucketName,
        Key: `pdf-template/${clientId}/${templateId}/${versionId}.pdf`,
        Body: new Uint8Array(await pdfBytes.arrayBuffer()),
        Metadata: {
          'client-id': clientId,
          'file-type': 'pdf-template',
          'template-id': templateId,
          'version-id': versionId,
        },
      });
    });

    test('returns error when upload fails', async () => {
      const { letterUploadRepository, mocks } = setup();

      const err = new Error('could not upload');

      mocks.s3Client.on(PutObjectCommand).rejects(err);

      const result = await letterUploadRepository.upload(
        templateId,
        { userId, clientId },
        versionId,
        pdf,
        csv
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 500,
            details: undefined,
            description: 'Failed to upload letter files',
          },
        },
      });

      expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);
    });
  });

  describe('download', () => {
    it('gets the object from s3 and returns the body as Uint8Array', async () => {
      const { letterUploadRepository, mocks } = setup();

      const expected = Uint8Array.from('hello');
      mocks.s3Client.on(GetObjectCommand).resolves({
        Body: mock<GetObjectCommandOutput['Body']>({
          transformToByteArray: async () => expected,
        }),
      });

      const res = await letterUploadRepository.download(
        'template-id',
        'template-owner',
        'pdf-template',
        'file-version-id'
      );

      expect(mocks.s3Client).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: 'internal-bucket',
        Key: 'pdf-template/template-owner/template-id/file-version-id.pdf',
      });
      expect(res).toBe(expected);
    });

    it('returns void if command throws NotFound', async () => {
      const { letterUploadRepository, mocks } = setup();
      mocks.s3Client
        .on(GetObjectCommand)
        .rejects(new NotFound({ $metadata: {}, message: 'NotFound' }));

      const res = await letterUploadRepository.download(
        'template-id',
        'template-owner',
        'pdf-template',
        'file-version-id'
      );

      expect(res).toBeUndefined();
    });

    it('raises other exceptions', async () => {
      const { letterUploadRepository, mocks } = setup();
      mocks.s3Client.on(GetObjectCommand).rejects(new Error('oh no'));

      await expect(
        letterUploadRepository.download(
          'template-id',
          'template-owner',
          'pdf-template',
          'file-version-id'
        )
      ).rejects.toThrow('oh no');
    });
  });

  describe('static parseKey', () => {
    it('returns metadata from valid pdf key', () => {
      expect(
        LetterUploadRepository.parseKey(
          'pdf-template/owner-id/template-id/version-id.pdf'
        )
      ).toEqual({
        'file-type': 'pdf-template',
        'client-id': 'owner-id',
        'template-id': 'template-id',
        'version-id': 'version-id',
      });
    });

    it('returns metadata from valid csv key', () => {
      expect(
        LetterUploadRepository.parseKey(
          'test-data/owner-id/template-id/version-id.csv'
        )
      ).toEqual({
        'file-type': 'test-data',
        'client-id': 'owner-id',
        'template-id': 'template-id',
        'version-id': 'version-id',
      });
    });

    it('errors if key if too long', () => {
      expect(() =>
        LetterUploadRepository.parseKey(
          'test-data/owner-id/template-id/unexpected-path/version-id.csv'
        )
      ).toThrowErrorMatchingSnapshot();
    });

    it('errors if key if too short', () => {
      expect(() =>
        LetterUploadRepository.parseKey('test-data/owner-id/version-id.csv')
      ).toThrowErrorMatchingSnapshot();
    });

    it('errors if invalid file type segment', () => {
      expect(() =>
        LetterUploadRepository.parseKey(
          'unexpected/owner-id/template-id/version-id.csv'
        )
      ).toThrowErrorMatchingSnapshot();
    });

    it('errors if no file extension', () => {
      expect(() =>
        LetterUploadRepository.parseKey(
          'test-data/owner-id/template-id/version-id'
        )
      ).toThrowErrorMatchingSnapshot();
    });

    it('errors if filename has too many parts', () => {
      expect(() =>
        LetterUploadRepository.parseKey(
          'test-data/owner-id/template-id/version-id.unexpected.csv'
        )
      ).toThrowErrorMatchingSnapshot();
    });

    it('errors if file extension does not match csv file type', () => {
      expect(() =>
        LetterUploadRepository.parseKey(
          'test-data/owner-id/template-id/version-id.pdf'
        )
      ).toThrowErrorMatchingSnapshot();
    });

    it('errors if file extension does not match pdf file type', () => {
      expect(() =>
        LetterUploadRepository.parseKey(
          'pdf-template/owner-id/template-id/version-id.csv'
        )
      ).toThrowErrorMatchingSnapshot();
    });
  });
});
