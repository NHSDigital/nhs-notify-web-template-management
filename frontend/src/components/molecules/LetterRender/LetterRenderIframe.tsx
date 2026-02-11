'use client';

import type { RenderTab } from './types';

type LetterRenderIframeProps = {
  tab: RenderTab;
  pdfUrl: string | null;
};

export function LetterRenderIframe({ tab, pdfUrl }: LetterRenderIframeProps) {
  if (!pdfUrl) return <p className='nhsuk-body'>No preview available</p>;

  const tabLabel = tab === 'short' ? 'short' : 'long';

  return (
    <iframe
      src={pdfUrl}
      title={`Letter preview - ${tabLabel} examples`}
      aria-label={`PDF preview of letter template with ${tabLabel} example personalisation data`}
      referrerPolicy='no-referrer'
    />
  );
}
