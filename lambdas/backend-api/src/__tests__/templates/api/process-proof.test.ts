import { mockDeep } from 'jest-mock-extended';
import { createHandler } from '../../../templates/api/process-proof';
import { TemplateRepository } from '../../../templates/infra';
import { LetterFileRepository } from '@backend-api/templates/infra/letter-file-repository';

test.each([
  ['NO_THREATS_FOUND', 'PASSED'],
  ['THREATS_FOUND', 'FAILED'],
])(
  'calls dependencies as expected for a %s virus scan',
  async (scanResultStatus, virusScanStatus) => {
    const templateRepository = mockDeep<TemplateRepository>({
      getOwner: jest.fn().mockReturnValue('template-owner'),
    });
    const letterFileRepository = mockDeep<LetterFileRepository>();

    const handler = createHandler({
      templateRepository,
      letterFileRepository,
    });

    await handler({
      detail: {
        s3ObjectDetails: {
          objectKey: 'proofs/template-id/proof.pdf',
          versionId: 'version-id',
        },
        scanResultDetails: { scanResultStatus },
      },
    });

    expect(templateRepository.getOwner).toHaveBeenCalledWith('template-id');

    expect(
      letterFileRepository.copyFromQuarantineToInternal
    ).toHaveBeenCalledWith(
      'proofs/template-id/proof.pdf',
      'version-id',
      'proofs/template-owner/template-id/proof.pdf'
    );

    expect(
      templateRepository.setLetterFileVirusScanStatusForProof
    ).toHaveBeenCalledWith(
      'template-owner',
      'template-id',
      'proof',
      'proofs/template-owner/template-id/proof.pdf',
      virusScanStatus
    );
  }
);
