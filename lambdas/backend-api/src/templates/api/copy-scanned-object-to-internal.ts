import { z } from 'zod';
import type { TemplateFileScannedEventDetail } from 'nhs-notify-web-template-management-utils';
import type { LetterUploadRepository } from '../infra/letter-upload-repository';

type CopyScannedObjectToInternalLambdaInput = {
  detail: TemplateFileScannedEventDetail;
};

const $CopyScannedObjectToInternalLambdaInput: z.ZodType<CopyScannedObjectToInternalLambdaInput> =
  z.object({
    detail: z.object({
      template: z.object({
        id: z.string(),
        owner: z.string(),
      }),
      versionId: z.string(),
      fileType: z.enum(['pdf-template', 'test-data']),
      virusScanStatus: z.enum(['PASSED']),
    }),
  });

export const createHandler =
  ({
    letterUploadRepository,
  }: {
    letterUploadRepository: LetterUploadRepository;
  }) =>
  async (event: unknown) => {
    const {
      detail: { template, versionId, fileType },
    } = $CopyScannedObjectToInternalLambdaInput.parse(event);

    await letterUploadRepository.copyFromQuarantineToInternal(
      template,
      fileType,
      versionId
    );
  };
