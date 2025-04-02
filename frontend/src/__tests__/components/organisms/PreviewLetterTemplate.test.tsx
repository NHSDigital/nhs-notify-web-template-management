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
