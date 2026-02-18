import type { File } from 'node:buffer';
import { z } from 'zod/v4';
import { ErrorCase } from 'nhs-notify-backend-client';
import type { FileType, User } from 'nhs-notify-web-template-management-utils';
import {
  GetObjectCommand,
  NotFound,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ApplicationResult, failure, success } from '../utils';
import { LetterFileRepository } from './letter-file-repository';

export type LetterUploadMetadata = {
  'file-type': FileType;
  'client-id': string;
  'template-id': string;
  'version-id': string;
};

const $FileType: z.ZodType<FileType> = z.enum([
  'docx-template',
  'pdf-template',
  'test-data',
  'proofs',
]);

const $LetterUploadMetadata: z.ZodType<LetterUploadMetadata> = z.object({
  'file-type': $FileType,
  'client-id': z.string(),
  'template-id': z.string(),
  'version-id': z.string(),
});

export class LetterUploadRepository extends LetterFileRepository {
  async upload(
    templateId: string,
    user: User,
    versionId: string,
    pdf: File,
    csv?: File
  ): Promise<ApplicationResult<null>> {
    const pdfKey = this.key(
      'pdf-template',
      user.clientId,
      templateId,
      versionId
    );

    const commands: PutObjectCommand[] = [
      new PutObjectCommand({
        Bucket: this.quarantineBucketName,
        Key: pdfKey,
        Body: await pdf.bytes(),
        ChecksumAlgorithm: 'SHA256',
        Metadata: LetterUploadRepository.metadata(
          user.clientId,
          templateId,
          versionId,
          'pdf-template'
        ),
      }),
    ];

    if (csv) {
      const csvKey = this.key(
        'test-data',
        user.clientId,
        templateId,
        versionId
      );

      commands.push(
        new PutObjectCommand({
          Bucket: this.quarantineBucketName,
          Key: csvKey,
          Body: await csv.bytes(),
          ChecksumAlgorithm: 'SHA256',
          Metadata: LetterUploadRepository.metadata(
            user.clientId,
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
    templateId: string,
    owner: string,
    fileType: FileType,
    versionId: string
  ): Promise<Uint8Array | void> {
    try {
      const { Body } = await this.client.send(
        new GetObjectCommand({
          Bucket: this.internalBucketName,
          Key: this.key(fileType, owner, templateId, versionId),
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
    const [type, clientId, templateId, filename = ''] = keyParts;
    const filenameParts = filename.split('.');
    const [versionId, extension] = filenameParts;

    if (keyParts.length !== 4 || filenameParts.length !== 2) {
      throw new Error(`Unexpected object key "${key}"`);
    }

    const parsed = LetterUploadRepository.metadata(
      clientId,
      templateId,
      versionId,
      type
    );

    const expectedExtension = LetterUploadRepository.extensionForType(
      parsed['file-type']
    );

    if (extension.toLowerCase() !== expectedExtension) {
      throw new Error(`Unexpected object key "${key}"`);
    }

    return parsed;
  }

  private key(
    type: FileType,
    clientId: string,
    templateId: string,
    versionId: string
  ) {
    return `${type}/${clientId}/${templateId}/${versionId}.${LetterUploadRepository.extensionForType(type)}`;
  }

  private static metadata(
    clientId: string,
    templateId: string,
    versionId: string,
    type: string
  ): LetterUploadMetadata {
    return $LetterUploadMetadata.parse({
      'client-id': clientId,
      'file-type': type,
      'template-id': templateId,
      'version-id': versionId,
    });
  }

  private static extensionForType(type: FileType): 'docx' | 'csv' | 'pdf' {
    switch (type) {
      case 'docx-template': {
        return 'docx';
      }
      case 'test-data': {
        return 'csv';
      }
      case 'pdf-template':
      case 'proofs': {
        return 'pdf';
      }
    }
  }
}
