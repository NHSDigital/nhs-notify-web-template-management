import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class S3Helper {
  readonly #s3Client: S3Client;

  constructor() {
    this.#s3Client = new S3Client({ region: 'eu-west-2' });
  }

  async getVersionId(bucket: string, objectKey: string) {
    const response = await this.#s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      })
    );

    return response.VersionId;
  }
}
