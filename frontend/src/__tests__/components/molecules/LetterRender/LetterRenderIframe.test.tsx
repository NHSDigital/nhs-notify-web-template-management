import { render, screen } from '@testing-library/react';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';

describe('LetterRenderIframe', () => {
  describe('PDF display', () => {
    it('renders iframe with provided pdfUrl', () => {
      render(
        <LetterRenderIframe
          src='/templates/files/client-123/renders/template-123/initial.pdf'
          title='Letter preview - short examples'
          aria-label='PDF preview of letter template with short example personalisation data'
        />
      );

      const iframe = screen.getByTitle('Letter preview - short examples');

      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-123/renders/template-123/initial.pdf'
      );
    });

    it('adds additional props', () => {
      render(
        <LetterRenderIframe
          src='/templates/files/client-123/renders/template-123/initial.pdf'
          title='Letter preview - long examples'
          aria-label='PDF preview of letter template with long example personalisation data'
          className='additional'
        />
      );

      const iframe = screen.getByTitle('Letter preview - long examples');

      expect(iframe).toHaveAttribute('class', 'additional');
    });
  });

  describe('missing file handling', () => {
    it('shows message when pdfUrl is undefined', () => {
      render(
        <LetterRenderIframe
          src={undefined}
          title='Letter preview - short examples'
          aria-label='PDF preview of letter template with short example personalisation data'
        />
      );

      expect(screen.getByText('No preview available')).toBeInTheDocument();

      expect(
        screen.queryByTitle('Letter preview - short examples')
      ).not.toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('matches snapshot with PDF URL', () => {
      const container = render(
        <LetterRenderIframe
          src='/templates/files/client-123/renders/template-123/initial.pdf'
          title='Letter preview - short examples'
          aria-label='PDF preview of letter template with short example personalisation data'
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot without PDF file', () => {
      const container = render(
        <LetterRenderIframe
          src={undefined}
          title='Letter preview - short examples'
          aria-label='PDF preview of letter template with short example personalisation data'
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
