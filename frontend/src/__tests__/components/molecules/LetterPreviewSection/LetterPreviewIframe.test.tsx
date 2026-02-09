import { render, screen } from '@testing-library/react';
import { LetterPreviewIframe } from '@molecules/LetterPreviewSection/LetterPreviewIframe';
import { getBasePath } from '@utils/get-base-path';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/get-base-path');
jest.mocked(getBasePath).mockReturnValue('/templates');

const baseTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
  clientId: 'client-123',
  name: 'Test Letter',
  templateStatus: 'NOT_YET_SUBMITTED',
  templateType: 'LETTER',
  letterType: 'x0',
  letterVersion: 'AUTHORING',
  letterVariantId: 'variant-123',
  sidesCount: 4,
  language: 'en',
  files: {
    initialRender: {
      fileName: 'initial.pdf',
      currentVersion: 'version-1',
      status: 'RENDERED',
    },
  },
  pdsPersonalisation: ['firstName', 'lastName'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('LetterPreviewIframe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PDF URL construction', () => {
    it('uses shortFormRender file for short variant', () => {
      const templateWithShort: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {
          ...baseTemplate.files,
          shortFormRender: {
            fileName: 'short-render.pdf',
            currentVersion: 'version-2',
            status: 'RENDERED',
            pdsPersonalisationPackId: 'short-1',
            personalisationParameters: {},
          },
        },
      };

      render(<LetterPreviewIframe template={templateWithShort} variant='short' />);

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-123/renders/template-123/short-render.pdf'
      );
    });

    it('uses longFormRender file for long variant', () => {
      const templateWithLong: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {
          ...baseTemplate.files,
          longFormRender: {
            fileName: 'long-render.pdf',
            currentVersion: 'version-3',
            status: 'RENDERED',
            pdsPersonalisationPackId: 'long-1',
            personalisationParameters: {},
          },
        },
      };

      render(<LetterPreviewIframe template={templateWithLong} variant='long' />);

      const iframe = screen.getByTitle('Letter preview - long examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-123/renders/template-123/long-render.pdf'
      );
    });

    it('falls back to initialRender when shortFormRender is missing', () => {
      render(<LetterPreviewIframe template={baseTemplate} variant='short' />);

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-123/renders/template-123/initial.pdf'
      );
    });

    it('falls back to initialRender when longFormRender is missing', () => {
      render(<LetterPreviewIframe template={baseTemplate} variant='long' />);

      const iframe = screen.getByTitle('Letter preview - long examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-123/renders/template-123/initial.pdf'
      );
    });
  });

  describe('missing file handling', () => {
    it('shows message when no render file is available', () => {
      const templateWithoutFiles: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {},
      };

      render(<LetterPreviewIframe template={templateWithoutFiles} variant='short' />);

      expect(
        screen.getByText(
          'No preview available. Upload a letter template to see a preview.'
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByTitle('Letter preview - short examples')
      ).not.toBeInTheDocument();
    });
  });

  describe('iframe attributes', () => {
    it('sets correct title for short variant', () => {
      render(<LetterPreviewIframe template={baseTemplate} variant='short' />);

      expect(screen.getByTitle('Letter preview - short examples')).toBeInTheDocument();
    });

    it('sets correct title for long variant', () => {
      render(<LetterPreviewIframe template={baseTemplate} variant='long' />);

      expect(screen.getByTitle('Letter preview - long examples')).toBeInTheDocument();
    });

    it('applies correct sizing styles', () => {
      render(<LetterPreviewIframe template={baseTemplate} variant='short' />);

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute('style', expect.stringContaining('width: 100%'));
      expect(iframe).toHaveAttribute('style', expect.stringContaining('height: 1200px'));
    });

    it('has referrerPolicy set to no-referrer', () => {
      render(<LetterPreviewIframe template={baseTemplate} variant='short' />);

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute('referrerPolicy', 'no-referrer');
    });
  });

  describe('snapshots', () => {
    it('matches snapshot with PDF URL', () => {
      const container = render(
        <LetterPreviewIframe template={baseTemplate} variant='short' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot without PDF file', () => {
      const templateWithoutFiles: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {},
      };

      const container = render(
        <LetterPreviewIframe template={templateWithoutFiles} variant='short' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
