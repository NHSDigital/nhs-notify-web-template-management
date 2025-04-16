import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
  _Object,
} from '@aws-sdk/client-s3';

export class S3Repository {
  constructor(
    private readonly bucket: string,
    private readonly client: S3Client
  ) {}

  s3Path(key: string) {
    return `s3://${this.bucket}/${key}`;
  }

  async putRawData(
    fileData: PutObjectCommandInput['Body'],
    key: string
  ): Promise<PutObjectCommandOutput> {
    return await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileData,
      })
    );
  }
}
