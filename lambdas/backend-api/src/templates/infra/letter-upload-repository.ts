import { ErrorCase } from 'nhs-notify-backend-client';
import { ApplicationResult, failure, success } from '../../utils';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class LetterUploadRepository {
  constructor(
    private readonly client: S3Client,
    private readonly bucketName: string
  ) {}

  async upload(
    templateId: string,
    owner: string,
    versionId: string,
    pdf: File,
    csv?: File
  ): Promise<ApplicationResult<null>> {
    const pdfKey = this.key(
      'pdf-template',
      owner,
      templateId,
      versionId,
      'pdf'
    );

    const commands: PutObjectCommand[] = [
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: pdfKey,
        Body: await pdf.bytes(),
        Metadata: this.metadata(owner, pdf.name, templateId, versionId, !!csv),
      }),
    ];

    if (csv) {
      const csvKey = this.key('test-data', owner, templateId, versionId, 'csv');

      commands.push(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: csvKey,
          Body: await csv.bytes(),
          Metadata: this.metadata(owner, csv.name, templateId, versionId),
        })
      );
    }

    try {
      await Promise.all(commands.map((cmd) => this.client.send(cmd)));
      return success(null);
    } catch (error) {
      return failure(
        ErrorCase.IO_FAILURE,
        'Failed to upload letter files',
        error
      );
    }
  }

  private key(
    type: string,
    owner: string,
    templateId: string,
    versionId: string,
    extension: string
  ) {
    return `${type}/${owner}/${templateId}/${versionId}.${extension}`;
  }

  private metadata(
    owner: string,
    userFilename: string,
    templateId: string,
    versionId: string,
    hasTestData?: boolean
  ) {
    return {
      owner,
      'user-filename': userFilename,
      'template-id': templateId,
      'version-id': versionId,
      ...(hasTestData && { 'test-data-provided': 'true' }),
    };
  }
}
