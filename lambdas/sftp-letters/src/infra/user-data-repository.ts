import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'node:path';

export class UserDataRepository {
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucket: string
  ) {}

  async get(
    owner: string,
    templateId: string,
    pdfVersion: string,
    testDataVersion?: string
  ) {
    const commands = [
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.pdfPath(owner, templateId, pdfVersion),
      }),
    ];

    if (testDataVersion) {
      commands.push(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.csvPath(owner, templateId, testDataVersion),
        })
      );
    }

    const [pdf, testData] = await Promise.all(
      commands.map((c) => this.s3Client.send(c))
    );

    return {
      pdf: pdf.Body,
      ...(testDataVersion && { csv: testData.Body }),
    };
  }

  private pdfPath(owner: string, templateId: string, version: string): string {
    return path.join('pdf-template', owner, templateId, `${version}.pdf`);
  }

  private csvPath(owner: string, templateId: string, version: string): string {
    return path.join('test-data', owner, templateId, `${version}.csv`);
  }
}
