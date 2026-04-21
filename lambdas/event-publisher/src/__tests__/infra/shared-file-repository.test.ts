import { mockDeep } from 'jest-mock-extended';
import { S3Client } from '@aws-sdk/client-s3';
import { SharedFileRepository } from '../../infra/shared-file-repository';

const mockS3Client = mockDeep<S3Client>({
  send: jest.fn(),
});

test('calls AWS SDK to copy object between buckets', async () => {
  const sharedFileRepository = new SharedFileRepository(
    mockS3Client,
    'internal-bucket',
    'shared-file-bucket'
  );

  await sharedFileRepository.upload('source/key.pdf', 'destination/key.pdf');

  expect(mockS3Client.send).toHaveBeenCalledWith(
    expect.objectContaining({
      input: expect.objectContaining({
        CopySource: 'internal-bucket/source/key.pdf',
        Bucket: 'shared-file-bucket',
        Key: 'destination/key.pdf',
      }),
    })
  );
});
