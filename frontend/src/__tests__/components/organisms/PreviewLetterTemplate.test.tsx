import { PreviewLetterTemplate } from '@organisms/PreviewLetterTemplate/PreviewLetterTemplate';
import { render } from '@testing-library/react';
import {
  useCampaignIds,
  useFeatureFlags,
} from '@providers/client-config-provider';

jest.mock('@providers/client-config-provider');

describe('PreviewLetterTemplate component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: false });
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
  });

  it('matches snapshot for AUTHORING letter version', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'NOT_YET_SUBMITTED',
          language: 'en',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          files: {},
          pdsPersonalisation: [],
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for AUTHORING letter with VIRUS_SCAN_FAILED status', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'VIRUS_SCAN_FAILED',
          language: 'en',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          files: {},
          pdsPersonalisation: [],
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for AUTHORING letter with VALIDATION_FAILED status', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'VALIDATION_FAILED',
          language: 'en',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          files: {},
          pdsPersonalisation: [],
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is VIRUS_SCAN_FAILED', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'VIRUS_SCAN_FAILED',
          language: 'en',
          letterType: 'x1',
          letterVersion: 'PDF',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'FAILED',
            },
            testDataCsv: undefined,
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is PENDING_PROOF_REQUEST', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '53525D03-1BC1-4563-ABF9-A74FF04142AF',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'PENDING_PROOF_REQUEST',
          letterType: 'q4',
          letterVersion: 'PDF',
          language: 'ar',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is WAITING_FOR_PROOF', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '53525D03-1BC1-4563-ABF9-A74FF04142AF',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'WAITING_FOR_PROOF',
          letterType: 'q4',
          letterVersion: 'PDF',
          language: 'ar',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is PROOF_AVAILABLE', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '2C56C5F6-B3AD-4FF8-A8A2-52E4FA8AF2BE',
          clientId: 'client-id',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'PROOF_AVAILABLE',
          letterType: 'x1',
          letterVersion: 'PDF',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'b',
              virusScanStatus: 'PASSED',
            },
            proofs: {
              'your-proof.pdf': {
                fileName: 'your-proof.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is PROOF_AVAILABLE and routing flag is enabled', () => {
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });
    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '2C56C5F6-B3AD-4FF8-A8A2-52E4FA8AF2BE',
          clientId: 'client-id',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'PROOF_AVAILABLE',
          letterType: 'x1',
          letterVersion: 'PDF',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'b',
              virusScanStatus: 'PASSED',
            },
            proofs: {
              'your-proof.pdf': {
                fileName: 'your-proof.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is PROOF_APPROVED', () => {
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });

    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '2C56C5F6-B3AD-4FF8-A8A2-52E4FA8AF2BE',
          clientId: 'client-id',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'PROOF_APPROVED',
          letterType: 'x1',
          letterVersion: 'PDF',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'b',
              virusScanStatus: 'PASSED',
            },
            proofs: {
              'your-proof.pdf': {
                fileName: 'your-proof.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is NOT_YET_SUBMITTED', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '0A097DCD-35F9-4DAD-A37E-AC358B71B74D',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'NOT_YET_SUBMITTED',
          letterType: 'x0',
          letterVersion: 'PDF',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'b',
              virusScanStatus: 'PASSED',
            },
            proofs: {
              'your-proof.pdf': {
                fileName: 'your-proof.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is VALIDATION_FAILED', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'VALIDATION_FAILED',
          language: 'en',
          letterType: 'x1',
          letterVersion: 'PDF',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
            testDataCsv: {
              fileName: 'file.csv',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is PENDING_UPLOAD', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'PENDING_UPLOAD',
          language: 'en',
          letterType: 'x1',
          letterVersion: 'PDF',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PENDING',
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template status is PENDING_VALIDATION', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'PENDING_VALIDATION',
          language: 'en',
          letterType: 'x1',
          letterVersion: 'PDF',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
          },
          proofingEnabled: true,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when template language is Right to Left', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '0A097DCD-35F9-4DAD-A37E-AC358B71B74D',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'NOT_YET_SUBMITTED',
          letterType: 'x0',
          letterVersion: 'PDF',
          language: 'ar',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'b',
              virusScanStatus: 'PASSED',
            },
            proofs: {
              'your-proof.pdf': {
                fileName: 'your-proof.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
            },
          },
          proofingEnabled: false,
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
