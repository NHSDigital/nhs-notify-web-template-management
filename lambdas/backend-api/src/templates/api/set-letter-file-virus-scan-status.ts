import { z } from 'zod';
import {
  $GuardDutyMalwareScanStatus,
  type GuardDutyMalwareScanStatus,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import type { LetterUploadMetadata } from '../infra/letter-upload-repository';

type SetLetterFileVirusScanStatusLambdaInput = {
  detail: {
    object: {
      metadata: Omit<
        LetterUploadMetadata,
        'user-filename' | 'test-data-provided'
      >;
      tags: { GuardDutyMalwareScanStatus: GuardDutyMalwareScanStatus };
    };
  };
};

const $SetLetterFileVirusScanStatusLambdaInput: z.ZodType<SetLetterFileVirusScanStatusLambdaInput> =
  z.object({
    detail: z.object({
      object: z.object({
        metadata: z.object({
          owner: z.string(),
          'template-id': z.string(),
          'version-id': z.string(),
          'file-type': z.enum(['pdf-template', 'test-data']),
        }),
        tags: z.object({
          GuardDutyMalwareScanStatus: $GuardDutyMalwareScanStatus,
        }),
      }),
    }),
  });

export const createHandler =
  ({ templateRepository }: { templateRepository: TemplateRepository }) =>
  async (event: unknown) => {
    const {
      detail: {
        object: { metadata, tags },
      },
    } = $SetLetterFileVirusScanStatusLambdaInput.parse(event);

    await templateRepository.setLetterFileVirusScanStatus(
      { owner: metadata.owner, id: metadata['template-id'] },
      metadata['file-type'] === 'pdf-template' ? 'pdfTemplate' : 'testDataCsv',
      metadata['version-id'],
      tags.GuardDutyMalwareScanStatus === 'NO_THREATS_FOUND'
        ? 'PASSED'
        : 'FAILED'
    );
  };
