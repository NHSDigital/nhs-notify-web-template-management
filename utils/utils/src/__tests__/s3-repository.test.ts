import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { Readable } from 'node:stream';
import { S3Repository } from '../s3-repository';

const BUCKET = 'test-bucket';

function setup() {
  const s3Mock = mockClient(S3Client);
  const client = new S3Client({});
  const repository = new S3Repository(BUCKET, client);

  return { s3Mock, client, repository };
}

afterEach(() => {
  mockClient(S3Client).reset();
});

describe('putRawData', () => {
  it('sends PutObjectCommand with bucket, key, and body', async () => {
    const { s3Mock, repository } = setup();

    const data = Buffer.from('file-content');

    await repository.putRawData(data, 'some/key.txt');

    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: BUCKET,
      Key: 'some/key.txt',
      Body: data,
      ChecksumAlgorithm: 'SHA256',
    });
  });

  it('merges additional options into the PutObjectCommand', async () => {
    const { s3Mock, repository } = setup();

    const data = Buffer.from('file-content');

    await repository.putRawData(data, 'some/key.txt', {
      ContentType: 'application/pdf',
      ServerSideEncryption: 'aws:kms',
    });

    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: BUCKET,
      Key: 'some/key.txt',
      Body: data,
      ChecksumAlgorithm: 'SHA256',
      ContentType: 'application/pdf',
      ServerSideEncryption: 'aws:kms',
    });
  });
});

describe('getObjectResponseWithReadableBody', () => {
  it('returns the response when the body is a Readable stream', async () => {
    const { s3Mock, repository } = setup();

    const readable = Readable.from(['hello']);

    s3Mock.on(GetObjectCommand).callsFake(() => ({
      Body: readable,
      $metadata: {},
    }));

    const response =
      await repository.getObjectResponseWithReadableBody('my/key.txt');

    expect(response.Body).toEqual(readable);
    expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
      Bucket: BUCKET,
      Key: 'my/key.txt',
    });
  });

  it('throws when the body is not a Readable stream', async () => {
    const { s3Mock, repository } = setup();

    s3Mock.on(GetObjectCommand).resolves({
      Body: undefined,
      $metadata: {},
    });

    await expect(
      repository.getObjectResponseWithReadableBody('my/key.txt')
    ).rejects.toThrow(`Could not read file 's3://${BUCKET}/my/key.txt'`);
  });

  it('wraps Error instances thrown by the S3 client', async () => {
    const { s3Mock, repository } = setup();

    s3Mock.on(GetObjectCommand).rejects(new Error('NoSuchKey'));

    await expect(
      repository.getObjectResponseWithReadableBody('missing/key.txt')
    ).rejects.toThrow(
      `Could not retrieve 's3://${BUCKET}/missing/key.txt' from S3: NoSuchKey`
    );
  });

  it('wraps non-Error values thrown by the S3 client', async () => {
    const { client, repository } = setup();

    jest.spyOn(client, 'send').mockImplementation(() => {
      return Promise.reject('raw-string-error');
    });

    await expect(
      repository.getObjectResponseWithReadableBody('bad/key.txt')
    ).rejects.toThrow(
      `Could not retrieve 's3://${BUCKET}/bad/key.txt' from S3: raw-string-error`
    );
  });
});

describe('getObjectStream', () => {
  it('returns the Readable body from the S3 response', async () => {
    const { s3Mock, repository } = setup();

    const readable = Readable.from(['stream-data']);

    s3Mock.on(GetObjectCommand).callsFake(() => ({
      Body: readable,
      $metadata: {},
    }));

    const stream = await repository.getObjectStream('stream/key.txt');

    expect(stream).toBe(readable);
  });

  it('rethrows error from S3', async () => {
    const { s3Mock, repository } = setup();

    s3Mock.on(GetObjectCommand).rejects(new Error('s3err'));

    await expect(repository.getObjectStream('k')).rejects.toThrow(
      `Could not retrieve 's3://${BUCKET}/k' from S3: s3err`
    );
  });

  it('throws when body is not readable', async () => {
    const { s3Mock, repository } = setup();

    s3Mock.on(GetObjectCommand).resolves({
      Body: undefined,
      $metadata: {},
    });

    await expect(repository.getObjectStream('k')).rejects.toThrow(
      `Could not read file 's3://${BUCKET}/k'`
    );
  });
});
