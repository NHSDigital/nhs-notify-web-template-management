import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { mock } from 'jest-mock-extended';
import { S3Repository } from '../s3-repository';

afterEach(jest.resetAllMocks);

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
