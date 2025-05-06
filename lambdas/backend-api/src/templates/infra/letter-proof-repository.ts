import { LetterFileRepository } from './letter-file-repository';

export type LetterProofMetadata = {
  templateId: string;
  fileName: string;
};

export class LetterProofRepository extends LetterFileRepository {
  static parseQuarantineKey(key: string): LetterProofMetadata {
    const keyParts = key.split('/');
    const [fileType, templateId, fileNameWithExtension] = keyParts;
    const [fileName, extension] = fileNameWithExtension.split('.');

    if (
      keyParts.length !== 3 ||
      fileType !== 'proofs' ||
      extension.toLowerCase() !== 'pdf'
    ) {
      throw new Error(`Unexpected object key "${key}"`);
    }

    return {
      templateId,
      fileName,
    };
  }

  static getInternalKey(owner: string, templateId: string, fileName: string) {
    return `proofs/${owner}/${templateId}/${fileName}.pdf`;
  }

  static getDownloadKey(owner: string, templateId: string, fileName: string) {
    return `${owner}/proofs/${templateId}/${fileName}.pdf`;
  }
}
