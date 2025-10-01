import { S3Client } from '@aws-sdk/client-s3';
import {
  writeFile,
  listAllFiles,
  deleteFile,
  getFileHead,
  transferFileToNewBucket,
  transferFileToClient,
} from '../../utils/s3-utils';

test('writeFile', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy.mockImplementation(() => {});

  const testContent = '[{"test":"content"}]';
  const testBucketName = 'test-bucket-name';
  const testFilePath = '/test/file/path.json';

  await writeFile(testFilePath, testContent, testBucketName);

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        Body: testContent,
        Bucket: testBucketName,
        ContentType: 'application/json',
        Key: testFilePath,
      },
    })
  );
});

test('listAllFiles', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy.mockImplementation(() => ({
    Contents: [{ Key: 'item' }],
  }));

  await listAllFiles('bucket-name');

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        Bucket: 'bucket-name',
        MaxKeys: 1000,
      },
    })
  );
});

test('deleteFile', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy.mockImplementation(() => ({}));

  await deleteFile('bucket-name', 'key');

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        Bucket: 'bucket-name',
        Key: 'key',
      },
    })
  );
});

test('deleteFile - throws error', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy.mockImplementation(() => {
    throw new Error('error');
  });

  await expect(
    async () => await deleteFile('bucket-name', 'key')
  ).rejects.toThrow('Failed deleting key');

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        Bucket: 'bucket-name',
        Key: 'key',
      },
    })
  );
});

test('getFileHead', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy.mockImplementation(() => 'file-head');

  const fileHead = await getFileHead('bucket-name', 'key');

  expect(fileHead).toEqual('file-head');

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        Bucket: 'bucket-name',
        Key: 'key',
      },
    })
  );
});

test('transferFileToNewBucket', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy.mockImplementation(() => ({}));

  await transferFileToNewBucket(
    'source-bucket',
    'destination-bucket',
    'source-key',
    'destination-key'
  );

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        CopySource: 'source-bucket/source-key',
        Bucket: 'destination-bucket',
        Key: 'destination-key',
        MetadataDirective: 'COPY',
        TaggingDirective: 'COPY',
      },
    })
  );
});

test('transferFileToClient', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy
    .mockImplementationOnce(() => ({
      Metadata: {},
      ContentType: 'content-type',
    }))
    .mockImplementation(() => ({}));

  await transferFileToClient(
    'bucket',
    'source-key',
    'destination-key',
    'client-id'
  );

  expect(sendSpy).toHaveBeenCalledTimes(2);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        CopySource: 'bucket/source-key',
        Bucket: 'bucket',
        Key: 'destination-key',
        Metadata: {
          'client-id': 'client-id',
        },
        MetadataDirective: 'REPLACE',
        TaggingDirective: 'COPY',
        ContentType: 'content-type',
      },
    })
  );
});

test('transferFileToClient - no metadata', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy
    .mockImplementationOnce(() => ({
      ContentType: 'content-type',
    }))
    .mockImplementation(() => ({}));

  await transferFileToClient(
    'bucket',
    'source-key',
    'destination-key',
    'client-id'
  );

  expect(sendSpy).toHaveBeenCalledTimes(2);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        CopySource: 'bucket/source-key',
        Bucket: 'bucket',
        Key: 'destination-key',
        Metadata: {
          'client-id': 'client-id',
        },
        MetadataDirective: 'REPLACE',
        TaggingDirective: 'COPY',
        ContentType: 'content-type',
      },
    })
  );
});

test('transferFileToClient - throws error', async () => {
  const sendSpy = jest.spyOn(S3Client.prototype, 'send');
  sendSpy
    .mockImplementationOnce(() => ({
      Metadata: {},
      ContentType: 'content-type',
    }))
    .mockImplementation(() => {
      throw new Error('error');
    });

  await expect(
    async () =>
      await transferFileToClient(
        'bucket',
        'source-key',
        'destination-key',
        'client-id'
      )
  ).rejects.toThrow('Failed copying source-key to destination-key');

  expect(sendSpy).toHaveBeenCalledTimes(2);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        CopySource: 'bucket/source-key',
        Bucket: 'bucket',
        Key: 'destination-key',
        Metadata: {
          'client-id': 'client-id',
        },
        MetadataDirective: 'REPLACE',
        TaggingDirective: 'COPY',
        ContentType: 'content-type',
      },
    })
  );
});
