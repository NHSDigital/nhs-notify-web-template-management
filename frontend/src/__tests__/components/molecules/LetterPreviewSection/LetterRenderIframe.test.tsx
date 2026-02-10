import { render, screen } from '@testing-library/react';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';

describe('LetterRenderIframe', () => {
  describe('PDF display', () => {
    it('renders iframe with provided pdfUrl', () => {
      render(
        <LetterRenderIframe
          variant='short'
          pdfUrl='/templates/files/client-123/renders/template-123/initial.pdf'
          _previewState='idle'
        />
      );

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-123/renders/template-123/initial.pdf'
      );
    });

    it('renders correct title for short variant', () => {
      render(
        <LetterRenderIframe
          variant='short'
          pdfUrl='/test.pdf'
          _previewState='idle'
        />
      );

      expect(
        screen.getByTitle('Letter preview - short examples')
      ).toBeInTheDocument();
    });

    it('renders correct title for long variant', () => {
      render(
        <LetterRenderIframe
          variant='long'
          pdfUrl='/test.pdf'
          _previewState='idle'
        />
      );

      expect(
        screen.getByTitle('Letter preview - long examples')
      ).toBeInTheDocument();
    });
  });

  describe('missing file handling', () => {
    it('shows message when pdfUrl is null', () => {
      render(
        <LetterRenderIframe
          variant='short'
          pdfUrl={null}
          _previewState='idle'
        />
      );

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
    it('renders iframe without inline styles (styles applied via CSS)', () => {
      render(
        <LetterRenderIframe
          variant='short'
          pdfUrl='/test.pdf'
          _previewState='idle'
        />
      );

      const iframe = screen.getByTitle('Letter preview - short examples');
      // Styles are now applied via CSS module, not inline
      expect(iframe).not.toHaveAttribute('style');
    });

    it('has referrerPolicy set to no-referrer', () => {
      render(
        <LetterRenderIframe
          variant='short'
          pdfUrl='/test.pdf'
          _previewState='idle'
        />
      );

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute('referrerPolicy', 'no-referrer');
    });
  });

  describe('snapshots', () => {
    it('matches snapshot with PDF URL', () => {
      const container = render(
        <LetterRenderIframe
          variant='short'
          pdfUrl='/templates/files/client-123/renders/template-123/initial.pdf'
          _previewState='idle'
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot without PDF file', () => {
      const container = render(
        <LetterRenderIframe
          variant='short'
          pdfUrl={null}
          _previewState='idle'
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
