import type { RenderTab } from './types';

type LetterRenderIframeProps = {
  tab: RenderTab;
  pdfUrl: string | null;
};

export function LetterRenderIframe({ tab, pdfUrl }: LetterRenderIframeProps) {
  if (!pdfUrl) return <p className='nhsuk-body'>No preview available</p>;
  const tabDescription = tab === 'shortFormRender' ? 'short' : 'long';

  return (
    <iframe
      src={pdfUrl}
      title={`Letter preview - ${tabDescription} examples`}
      aria-label={`PDF preview of letter template with ${tabDescription} example personalisation data`}
    />
  );
}
