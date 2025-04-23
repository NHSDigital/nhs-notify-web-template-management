import { z } from 'zod';
import { ErrorCase } from 'nhs-notify-backend-client';
import type {
  FileType,
  TemplateKey,
} from 'nhs-notify-web-template-management-utils';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ApplicationResult, failure, success } from '../../utils';

export type LetterUploadMetadata = {
  'file-type': FileType;
  owner: string;
  'template-id': string;
  'version-id': string;
};

const $FileType: z.ZodType<FileType> = z.enum(['pdf-template', 'test-data']);

const $LetterUploadMetadata: z.ZodType<LetterUploadMetadata> = z.object({
  'file-type': $FileType,
  owner: z.string(),
  'template-id': z.string(),
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
        Metadata: LetterUploadRepository.metadata(
          owner,
          templateId,
          versionId,
          'pdf-template'
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
          Metadata: LetterUploadRepository.metadata(
            owner,
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

  async download(
    template: TemplateKey,
    fileType: FileType,
    versionId: string
  ): Promise<Uint8Array | void> {
    try {
      const { Body } = await this.client.send(
        new GetObjectCommand({
          Bucket: this.internalBucketName,
          Key: this.key(fileType, template.owner, template.id, versionId),
        })
      );

      return Body?.transformToByteArray();
    } catch (error) {
      if (error instanceof NotFound) {
        return;
      }

      throw error;
    }
  }

  async copyFromQuarantineToInternal(key: string, versionId: string) {
    await this.client.send(
      new CopyObjectCommand({
        CopySource: `/${this.quarantineBucketName}/${key}?versionId=${versionId}`,
        Bucket: this.internalBucketName,
        Key: key,
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

  static parseKey(key: string): LetterUploadMetadata {
    const keyParts = key.split('/');
    const [type, owner, templateId, filename = ''] = keyParts;
    const filenameParts = filename.split('.');
    const [versionId, extension] = filenameParts;

    if (keyParts.length !== 4 || filenameParts.length !== 2) {
      throw new Error(`Unexpected object key "${key}"`);
    }

    const parsed = LetterUploadRepository.metadata(
      owner,
      templateId,
      versionId,
      type
    );

    const expectedExtension =
      parsed['file-type'] === 'pdf-template' ? 'pdf' : 'csv';

    if (extension !== expectedExtension) {
      throw new Error(`Unexpected object key "${key}"`);
    }

    return parsed;
  }

  private key(
    type: FileType,
    owner: string,
    templateId: string,
    versionId: string
  ) {
    return `${type}/${owner}/${templateId}/${versionId}.${type === 'pdf-template' ? 'pdf' : 'csv'}`;
  }

  private static metadata(
    owner: string,
    templateId: string,
    versionId: string,
    type: string
  ): LetterUploadMetadata {
    return $LetterUploadMetadata.parse({
      owner,
      'file-type': type,
      'template-id': templateId,
      'version-id': versionId,
    });
  }
}
