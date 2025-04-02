import { render, screen } from '@testing-library/react';
import { PreviewLetterTemplate } from '@organisms/PreviewLetterTemplate/PreviewLetterTemplate';

describe('PreviewLetterTemplate component', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          id: '53525D03-1BC1-4563-ABF9-A74FF04142AF',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'NOT_YET_SUBMITTED',
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

  it('matches snapshot when template status is VIRUS_SCAN_FAILED', () => {
    const container = render(
      <PreviewLetterTemplate
        template={{
          templateType: 'LETTER',
          name: 'test-template-letter',
          id: 'template-id',
          templateStatus: 'VIRUS_SCAN_FAILED',
          language: 'en',
          letterType: 'q1',
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

  it('renders component correctly', () => {
    render(
      <PreviewLetterTemplate
        template={{
          id: '2DB31920-47E7-425C-8094-76AF0266823D',
          name: 'letter',
          templateType: 'LETTER',
          templateStatus: 'PENDING_VALIDATION',
          letterType: 'x0',
          language: 'en',
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

    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'Submit template'
    );
  });
});
