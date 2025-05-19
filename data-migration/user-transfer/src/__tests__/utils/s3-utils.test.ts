import { writeJsonToFile } from '@/src/utils/s3-utils';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => ({
  ...jest.requireActual('@aws-sdk/client-s3'),
}));

describe('s3-utils', () => {
  describe('writeJsonToFile', () => {
    test('should write JSON to an S3 object', async () => {
      // arrange
      const sendSpy = jest.spyOn(S3Client.prototype, 'send');
      sendSpy.mockImplementation(() => {});

      const testContent = '[{"test":"content"}]';
      const testBucketName = 'test-bucket-name';
      const testFilePath = '/test/file/path.json';

      // act
      await writeJsonToFile(testFilePath, testContent, testBucketName);

      // assert
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
  });
});
