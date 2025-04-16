import {
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
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

  async listObjects(prefix: string, delimiter?: string): Promise<_Object[]> {
    try {
      // aggregate results in listed
      const listed = [];
      // allow ContinuationToken to be undefined for the first call
      let ContinuationToken;

      do {
        const params: ListObjectsV2CommandInput = {
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken,
          Delimiter: delimiter,
        };
        const data = await this.client.send(new ListObjectsV2Command(params));

        listed.push(...(data.Contents ?? []));
        ContinuationToken = data.NextContinuationToken;
      } while (ContinuationToken);

      return listed;
    } catch (error_) {
      const error = error_ as Error;
      throw new Error(
        `Could not list files in S3 location ${this.s3Path(prefix)}: ${
          error.name
        } ${error.message}`
      );
    }
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
