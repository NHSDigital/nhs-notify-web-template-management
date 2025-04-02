import { z } from 'zod';
import { ErrorCase } from 'nhs-notify-backend-client';
import type {
  FileType,
  TemplateKey,
} from 'nhs-notify-web-template-management-utils';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ApplicationResult, failure, success } from '../../utils';

export type LetterUploadMetadata = {
  'file-type': FileType;
  owner: string;
  'template-id': string;
  'test-data-provided'?: 'true' | 'false';
  'user-filename': string;
  'version-id': string;
};

const $LetterUploadMetadata: z.ZodType<LetterUploadMetadata> = z.object({
  'file-type': z.enum(['pdf-template', 'test-data']),
  owner: z.string(),
  'template-id': z.string(),
  'test-data-provided': z.enum(['true', 'false']).optional(),
  'user-filename': z.string(),
  'version-id': z.string(),
});

export class LetterUploadRepository {
  private readonly client = new S3Client();

  constructor(
    private readonly quarantineBucketName: string,
    private readonly internalBucketName: string
  ) {}

  async upload(
    templateId: string,
    owner: string,
    versionId: string,
    pdf: File,
    csv?: File
  ): Promise<ApplicationResult<null>> {
    const pdfKey = this.key('pdf-template', owner, templateId, versionId);

    const commands: PutObjectCommand[] = [
      new PutObjectCommand({
        Bucket: this.quarantineBucketName,
        Key: pdfKey,
        Body: await pdf.bytes(),
        ChecksumAlgorithm: 'SHA256',
        Metadata: this.metadata(
          owner,
          pdf.name,
          templateId,
          versionId,
          'pdf-template',
          !!csv
        ),
      }),
    ];

    if (csv) {
      const csvKey = this.key('test-data', owner, templateId, versionId);

      commands.push(
        new PutObjectCommand({
          Bucket: this.quarantineBucketName,
          Key: csvKey,
          Body: await csv.bytes(),
          ChecksumAlgorithm: 'SHA256',
          Metadata: this.metadata(
            owner,
            csv.name,
            templateId,
            versionId,
            'test-data'
          ),
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

  async getFileMetadata(
    bucket: string,
    key: string,
    versionId: string
  ): Promise<LetterUploadMetadata> {
    const { Metadata } = await this.client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
        VersionId: versionId,
      })
    );

    return $LetterUploadMetadata.parse(Metadata);
  }

  async copyFromQuarantineToInternal(
    template: TemplateKey,
    fileType: FileType,
    versionId: string
  ) {
    const key = this.key(fileType, template.owner, template.id, versionId);
    await this.client.send(
      new CopyObjectCommand({
        CopySource: `/${this.quarantineBucketName}/${key}`,
        Bucket: this.internalBucketName,
        Key: key,
        MetadataDirective: 'COPY',
        TaggingDirective: 'COPY',
      })
    );
  }

  async deleteFromQuarantine(
    template: TemplateKey,
    fileType: FileType,
    versionId: string
  ) {
    const key = this.key(fileType, template.owner, template.id, versionId);

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.quarantineBucketName,
        Key: key,
      })
    );
  }

  private key(
    type: FileType,
    owner: string,
    templateId: string,
    versionId: string
  ) {
    return `${type}/${owner}/${templateId}/${versionId}.${type === 'pdf-template' ? 'pdf' : 'csv'}`;
  }

  private metadata(
    owner: string,
    userFilename: string,
    templateId: string,
    versionId: string,
    type: FileType,
    hasTestData?: boolean
  ): LetterUploadMetadata {
    return {
      owner,
      'file-type': type,
      'user-filename': userFilename,
      'template-id': templateId,
      'version-id': versionId,
      ...(hasTestData !== undefined && {
        'test-data-provided': `${hasTestData}`,
      }),
    };
  }
}
