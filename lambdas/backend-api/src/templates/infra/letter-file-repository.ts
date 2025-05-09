import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export class LetterFileRepository {
  protected readonly client = new S3Client();

  constructor(
    protected readonly quarantineBucketName: string,
    protected readonly internalBucketName: string,
    protected readonly downloadBucketName: string
  ) {}

  async copyFromQuarantineToInternal(
    key: string,
    versionId: string,
    destinationKey?: string
  ) {
    await this.copy(
      this.quarantineBucketName,
      this.internalBucketName,
      key,
      versionId,
      destinationKey
    );
  }

  private async copy(
    sourceBucket: string,
    destinationBucket: string,
    key: string,
    versionId: string,
    destinationKey?: string
  ) {
    await this.client.send(
      new CopyObjectCommand({
        CopySource: `/${sourceBucket}/${key}?versionId=${versionId}`,
        Bucket: destinationBucket,
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

  async copyFromQuarantineToDownload(
    key: string,
    versionId: string,
    destinationKey: string
  ) {
    await this.copy(
      this.quarantineBucketName,
      this.downloadBucketName,
      key,
      versionId,
      destinationKey
    );
  }
}
