import {
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { mock, mockDeep } from 'jest-mock-extended';
import { S3Repository } from '../s3-repository';

afterEach(jest.resetAllMocks);

describe('listObjects', () => {
  it('Should throw an error if invalid key', async () => {
    const client = mock<S3Client>(
      mockClient(S3Client).on(ListObjectsV2Command).rejects('No file found')
    );

    const s3r = new S3Repository('bucket-name', client);

    await expect(s3r.listObjects('config.test.json')).rejects.toThrow(
      'Could not list files in S3 location s3://bucket-name/config.test.json: Error No file found'
    );
  });

  it('Should return key', async () => {
    const client = mock<S3Client>(
      mockClient(S3Client)
        .on(ListObjectsV2Command)
        .resolves({ Contents: [{ Key: 'KEY' }] })
    );
    const s3r = new S3Repository('bucket-name', client);

    const result = await s3r.listObjects('config.test.json');

    expect(result).toEqual([{ Key: 'KEY' }]);

    expect(client).toHaveReceivedCommandWith(ListObjectsV2Command, {
      Bucket: 'bucket-name',
      Prefix: 'config.test.json',
    });
  });

  it('Should page', async () => {
    const client = mockDeep<S3Client>({
      send: jest.fn(async (sendCommand) => {
        if (
          (sendCommand.input as ListObjectsV2CommandInput)
            ?.ContinuationToken === 'next'
        ) {
          return {
            Contents: ['d', 'e', 'f'],
            NextContinuationToken: 'next2',
          };
        }
        if (
          (sendCommand.input as ListObjectsV2CommandInput)
            ?.ContinuationToken === 'next2'
        ) {
          return {
            Contents: undefined,
            NextContinuationToken: undefined,
          };
        }
        return {
          Contents: ['a', 'b', 'c'],
          NextContinuationToken: 'next',
        };
      }),
    });

    const s3r = new S3Repository('bucket-name', client);

    const result = await s3r.listObjects('config.test.json');

    expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);

    expect(client.send.mock.calls).toEqual([
      [
        expect.objectContaining({
          input: {
            Bucket: 'bucket-name',
            Prefix: 'config.test.json',
          },
        }),
      ],
      [
        expect.objectContaining({
          input: {
            Bucket: 'bucket-name',
            ContinuationToken: 'next',
            Prefix: 'config.test.json',
          },
        }),
      ],
      [
        expect.objectContaining({
          input: {
            Bucket: 'bucket-name',
            ContinuationToken: 'next2',
            Prefix: 'config.test.json',
          },
        }),
      ],
    ]);
  });
});

describe('putRawData', () => {
  it('calls client as expected', async () => {
    const client = mock<S3Client>(mockClient(S3Client));

    const data = Buffer.from('some string');

    const s3r = new S3Repository('bucket-name', client);

    await s3r.putRawData(data, 'bucket-key');

    expect(client).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: 'bucket-name',
      Key: 'bucket-key',
      Body: data,
    });
  });
});
