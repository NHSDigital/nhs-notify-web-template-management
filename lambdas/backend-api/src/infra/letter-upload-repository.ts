import { z } from 'zod/v4';
import type { FileType, User } from 'nhs-notify-web-template-management-utils';
import {
  GetObjectCommand,
  NotFound,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ApplicationResult, success } from '../utils';
import { LetterFileRepository } from './letter-file-repository';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
  'docx-template',
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
    fileType: 'pdf-template' | 'docx-template'
  ): Promise<ApplicationResult<string>> {
    const pdfKey = this.key(fileType, user.clientId, templateId, versionId);

    const commands: PutObjectCommand[] = [
      new PutObjectCommand({
        Bucket: this.quarantineBucketName,
        Key: pdfKey,
        ChecksumAlgorithm: 'SHA256',
        Metadata: LetterUploadRepository.metadata(
          user.clientId,
          templateId,
          versionId,
          fileType
        ),
      }),
    ];

    const presignedUrl = await getSignedUrl(this.client, commands[0], {
      expiresIn: 300,
    });

    return success(presignedUrl);
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
