import { PreviewLetterTemplate } from '@organisms/PreviewLetterTemplate/PreviewLetterTemplate';
import { render } from '@testing-library/react';

describe('PreviewLetterTemplate component', () => {
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
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'FAILED',
            },
            testDataCsv: undefined,
          },
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
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
          language: 'ar',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
          },
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
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
          language: 'ar',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
          },
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
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
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'PROOF_AVAILABLE',
          letterType: 'x1',
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
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
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
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
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
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
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
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PENDING',
            },
          },
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
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
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: 'a',
              virusScanStatus: 'PASSED',
            },
          },
          createdAt: '2025-04-02T09:33:25.729Z',
          updatedAt: '2025-04-02T09:33:25.729Z',
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
