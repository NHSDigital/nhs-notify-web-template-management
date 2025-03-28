import { z } from 'zod';
import {
  $GuardDutyMalwareScanStatus,
  type GuardDutyMalwareScanStatus,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import type { LetterUploadMetadata } from '../infra/letter-upload-repository';

type SetLetterFileVirusScanStatusLambdaInput = {
  detail: {
    s3ObjectDetails: {
      metadata: Omit<
        LetterUploadMetadata,
        'user-filename' | 'test-data-provided'
      >;
    };
    scanResultDetails: {
      scanResultStatus: GuardDutyMalwareScanStatus;
    };
  };
};

const $SetLetterFileVirusScanStatusLambdaInput: z.ZodType<SetLetterFileVirusScanStatusLambdaInput> =
  z.object({
    detail: z.object({
      s3ObjectDetails: z.object({
        metadata: z.object({
          owner: z.string(),
          'template-id': z.string(),
          'version-id': z.string(),
          'file-type': z.enum(['pdf-template', 'test-data']),
        }),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $GuardDutyMalwareScanStatus,
      }),
    }),
  });

export const createHandler =
  ({ templateRepository }: { templateRepository: TemplateRepository }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { metadata },
        scanResultDetails: { scanResultStatus },
      },
    } = $SetLetterFileVirusScanStatusLambdaInput.parse(event);

    await templateRepository.setLetterFileVirusScanStatus(
      { owner: metadata.owner, id: metadata['template-id'] },
      metadata['file-type'] === 'pdf-template' ? 'pdfTemplate' : 'testDataCsv',
      metadata['version-id'],
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED'
    );
  };
