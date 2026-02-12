import { render, screen } from '@testing-library/react';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';

describe('LetterRenderIframe', () => {
  describe('PDF display', () => {
    it('renders iframe with provided pdfUrl', () => {
      render(
        <LetterRenderIframe
          tab='short'
          pdfUrl='/templates/files/client-123/renders/template-123/initial.pdf'
        />
      );

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-123/renders/template-123/initial.pdf'
      );
    });

    it('renders correct title for short tab', () => {
      render(<LetterRenderIframe tab='short' pdfUrl='/test.pdf' />);

      expect(
        screen.getByTitle('Letter preview - short examples')
      ).toBeInTheDocument();
    });

    it('renders correct title for long tab', () => {
      render(<LetterRenderIframe tab='long' pdfUrl='/test.pdf' />);

      expect(
        screen.getByTitle('Letter preview - long examples')
      ).toBeInTheDocument();
    });
  });

  describe('missing file handling', () => {
    it('shows message when pdfUrl is null', () => {
      render(<LetterRenderIframe tab='short' pdfUrl={null} />);

      expect(screen.getByText('No preview available')).toBeInTheDocument();
      expect(
        screen.queryByTitle('Letter preview - short examples')
      ).not.toBeInTheDocument();
    });
  });

  describe('iframe attributes', () => {
    it('has referrerPolicy set to no-referrer', () => {
      render(<LetterRenderIframe tab='short' pdfUrl='/test.pdf' />);

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute('referrerPolicy', 'no-referrer');
    });
  });

  describe('snapshots', () => {
    it('matches snapshot with PDF URL', () => {
      const container = render(
        <LetterRenderIframe
          tab='short'
          pdfUrl='/templates/files/client-123/renders/template-123/initial.pdf'
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot without PDF file', () => {
      const container = render(
        <LetterRenderIframe tab='short' pdfUrl={null} />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
