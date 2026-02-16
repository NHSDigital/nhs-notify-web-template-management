import {
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

type PutObjectOptions = Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'>;

export type GetObjectOutputReadableBody = GetObjectCommandOutput & {
  Body: Readable;
};

export class S3Repository {
  constructor(
    private readonly bucket: string,
    private readonly client: S3Client
  ) {}

  async putRawData(
    fileData: PutObjectCommandInput['Body'],
    key: string,
    options: PutObjectOptions = {}
  ): Promise<PutObjectCommandOutput> {
    // wrap errors incl path as in core?
    return await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileData,
        ...options,
      })
    );
  }

  async getObjectResponseWithReadableBody(
    key: string
  ): Promise<GetObjectOutputReadableBody> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };
      const response = await this.client.send(new GetObjectCommand(params));

      if (this.isReadableBody(response)) {
        return response;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Could not retrieve '${this.s3Path(key)}' from S3: ${msg}`
      );
    }

    throw new Error(`Could not read file '${this.s3Path(key)}'`);
  }

  async getObjectStream(key: string): Promise<Readable> {
    const response = await this.getObjectResponseWithReadableBody(key);
    return response.Body;
  }

  private s3Path(key: string) {
    return `s3://${this.bucket}/${key}`;
  }

  private isReadableBody(
    response: GetObjectCommandOutput
  ): response is GetObjectOutputReadableBody {
    return (
      response.Body !== undefined &&
      response.Body &&
      (response.Body as Readable).read !== undefined
    );
  }
}
