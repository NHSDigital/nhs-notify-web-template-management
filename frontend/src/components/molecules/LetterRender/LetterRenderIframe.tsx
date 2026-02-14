import type { RenderTab } from './types';

type LetterRenderIframeProps = {
  tab: RenderTab;
  pdfUrl: string | null;
};

export function LetterRenderIframe({ tab, pdfUrl }: LetterRenderIframeProps) {
  if (!pdfUrl) return <p className='nhsuk-body'>No preview available</p>;

  return (
    <iframe
      src={pdfUrl}
      title={`Letter preview - ${tab} examples`}
      aria-label={`PDF preview of letter template with ${tab} example personalisation data`}
      referrerPolicy='no-referrer'
    />
  );
}
