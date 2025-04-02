import { z } from 'zod';
import type { TemplateFileScannedEventDetail } from 'nhs-notify-web-template-management-utils';
import type { LetterUploadRepository } from '../infra';

type DeleteFailedScannedObjectLambdaInput = {
  detail: TemplateFileScannedEventDetail;
};

const $DeleteFailedScannedObjectLambdaInput: z.ZodType<DeleteFailedScannedObjectLambdaInput> =
  z.object({
    detail: z.object({
      template: z.object({
        id: z.string(),
        owner: z.string(),
      }),
      versionId: z.string(),
      fileType: z.enum(['pdf-template', 'test-data']),
      virusScanStatus: z.enum(['FAILED']),
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
    } = $DeleteFailedScannedObjectLambdaInput.parse(event);

    await letterUploadRepository.deleteFromQuarantine(
      template,
      fileType,
      versionId
    );
  };
