import { mockDeep } from 'jest-mock-extended';
import { createHandler } from '../../api/process-proof';
import { TemplateRepository } from '../../infra';
import { LetterFileRepository } from '../../infra/letter-file-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';

test.each([
  [
    'NO_THREATS_FOUND',
    'PASSED',
    (letterFileRepository: LetterFileRepository) => {
      expect(
        letterFileRepository.copyFromQuarantineToInternal
      ).toHaveBeenCalledWith(
        'proofs/supplier/template-id/proof.pdf',
        'version-id',
        'proofs/template-owner/template-id/proof.pdf'
      );
      expect(
        letterFileRepository.copyFromQuarantineToDownload
      ).toHaveBeenCalledWith(
        'proofs/supplier/template-id/proof.pdf',
        'version-id',
        'template-owner/proofs/template-id/proof.pdf'
      );
    },
  ],
  [
    'THREATS_FOUND',
    'FAILED',
    (letterFileRepository) => {
      expect(
        letterFileRepository.copyFromQuarantineToInternal
      ).not.toHaveBeenCalled();
      expect(
        letterFileRepository.copyFromQuarantineToDownload
      ).not.toHaveBeenCalled();
    },
  ],
])(
  'calls dependencies as expected for a %s virus scan',
  async (scanResultStatus, virusScanStatus, s3Expectation) => {
    const templateRepository = mockDeep<TemplateRepository>({
      getClientId: jest.fn().mockReturnValue('template-owner'),
    });
    const letterFileRepository = mockDeep<LetterFileRepository>();

    const handler = createHandler({
      templateRepository,
      letterFileRepository,
      logger: mockDeep<Logger>(),
    });

    await handler({
      detail: {
        s3ObjectDetails: {
          objectKey: 'proofs/supplier/template-id/proof.pdf',
          versionId: 'version-id',
        },
        scanResultDetails: { scanResultStatus },
      },
    });

    expect(templateRepository.getClientId).toHaveBeenCalledWith('template-id');

    s3Expectation(letterFileRepository);

    expect(
      templateRepository.setLetterFileVirusScanStatusForProof
    ).toHaveBeenCalledWith(
      {
        clientId: 'template-owner',
        templateId: 'template-id',
      },
      'proof.pdf',
      virusScanStatus,
      'supplier'
    );
  }
);
