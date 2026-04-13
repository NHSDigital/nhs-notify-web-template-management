import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class SharedFileRepository {
  constructor(
    private readonly client: S3Client,
    private readonly internalBucket: string,
    private readonly sharedFileBucket: string,
    private readonly sharedFileNamespace: string
  ) {}

  async upload(sourceKey: string, destinationKey: string) {
    await this.client.send(
      new CopyObjectCommand({
        CopySource: `${this.internalBucket}/${sourceKey}`,
        Bucket: this.sharedFileBucket,
        Key: `${this.sharedFileNamespace}/${destinationKey}`,
      })
    );
  }
}
