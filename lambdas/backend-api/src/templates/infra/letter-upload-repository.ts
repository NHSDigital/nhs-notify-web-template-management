import { z } from 'zod/v4';
import { ErrorCase } from 'nhs-notify-backend-client';
import type {
  FileType,
  TemplateKey,
} from 'nhs-notify-web-template-management-utils';
import {
  GetObjectCommand,
  NotFound,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ApplicationResult, failure, success } from '../../utils';
import { LetterFileRepository } from './letter-file-repository';

export type LetterUploadMetadata = {
  'file-type': FileType;
  owner: string;
  'template-id': string;
  'version-id': string;
};

const $FileType: z.ZodType<FileType> = z.enum([
  'pdf-template',
  'test-data',
  'proofs',
]);

const $LetterUploadMetadata: z.ZodType<LetterUploadMetadata> = z.object({
  'file-type': $FileType,
  owner: z.string(),
  'template-id': z.string(),
  'version-id': z.string(),
});

export class LetterUploadRepository extends LetterFileRepository {
  async upload(
    templateId: string,
    userId: string,
    versionId: string,
    pdf: File,
    csv?: File
  ): Promise<ApplicationResult<null>> {
    const pdfKey = this.key('pdf-template', userId, templateId, versionId);

    const commands: PutObjectCommand[] = [
      new PutObjectCommand({
        Bucket: this.quarantineBucketName,
        Key: pdfKey,
        Body: await pdf.bytes(),
        ChecksumAlgorithm: 'SHA256',
        Metadata: LetterUploadRepository.metadata(
          userId,
          templateId,
          versionId,
          'pdf-template'
        ),
      }),
    ];

    if (csv) {
      const csvKey = this.key('test-data', userId, templateId, versionId);

      commands.push(
        new PutObjectCommand({
          Bucket: this.quarantineBucketName,
          Key: csvKey,
          Body: await csv.bytes(),
          ChecksumAlgorithm: 'SHA256',
          Metadata: LetterUploadRepository.metadata(
            userId,
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
        ErrorCase.INTERNAL,
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
      parsed['file-type'] === 'test-data' ? 'csv' : 'pdf';

    if (extension.toLowerCase() !== expectedExtension) {
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
