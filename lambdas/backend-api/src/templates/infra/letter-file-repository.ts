import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export class LetterFileRepository {
  protected readonly client = new S3Client();

  constructor(
    protected readonly quarantineBucketName: string,
    protected readonly internalBucketName: string
  ) {}

  async copyFromQuarantineToInternal(
    key: string,
    versionId: string,
    destinationKey?: string
  ) {
    await this.client.send(
      new CopyObjectCommand({
        CopySource: `/${this.quarantineBucketName}/${key}?versionId=${versionId}`,
        Bucket: this.internalBucketName,
        Key: destinationKey ?? key,
        MetadataDirective: 'COPY',
        TaggingDirective: 'COPY',
      })
    );
  }

  async deleteFromQuarantine(key: string, versionId: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.quarantineBucketName,
        Key: key,
        VersionId: versionId,
      })
    );
  }
}
