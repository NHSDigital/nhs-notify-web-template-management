import {
  GetObjectCommand,
  GetObjectOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import path from 'node:path';
import { Readable } from 'node:stream';

export class UserDataRepository {
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucket: string
  ) {}

  async get(
    clientId: string,
    templateId: string,
    pdfVersion: string,
    testDataVersion?: string
  ) {
    const commands = [
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.pdfPath(clientId, templateId, pdfVersion),
      }),
    ];

    if (testDataVersion) {
      commands.push(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.csvPath(clientId, templateId, testDataVersion),
        })
      );
    }

    const [pdf, testData] = await Promise.all(
      commands.map((c) => this.s3Client.send(c))
    );

    const pdfStream = this.getReadableBody(pdf.Body);
    const testDataString = await testData?.Body?.transformToString();

    if (!pdfStream || (testDataVersion && !testDataString)) {
      throw new Error('Missing body on S3 response');
    }

    return {
      pdf: pdfStream,
      ...(testDataVersion && { testData: testDataString }),
    };
  }

  private pdfPath(
    clientId: string,
    templateId: string,
    version: string
  ): string {
    return path.join('pdf-template', clientId, templateId, `${version}.pdf`);
  }

  private csvPath(
    clientId: string,
    templateId: string,
    version: string
  ): string {
    return path.join('test-data', clientId, templateId, `${version}.csv`);
  }

  private getReadableBody(
    body: GetObjectOutput['Body'] | undefined
  ): Readable | undefined {
    if (this.isReadableBody(body)) {
      return body;
    }
  }

  private isReadableBody(
    body: GetObjectOutput['Body'] | undefined
  ): body is Readable {
    return body !== undefined && body && (body as Readable).read !== undefined;
  }
}
