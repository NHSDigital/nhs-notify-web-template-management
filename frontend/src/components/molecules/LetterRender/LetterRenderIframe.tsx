'use client';

import type { LetterPreviewVariant, PreviewState } from './types';

type LetterRenderIframeProps = {
  variant: LetterPreviewVariant;
  pdfUrl: string | null;
  _previewState: PreviewState;
};

export function LetterRenderIframe({
  variant,
  pdfUrl,
  _previewState,
}: LetterRenderIframeProps) {
  // Future: CCM-13495 - Show spinner when previewState === 'loading'
  // For now, we just show the iframe or a placeholder

  if (!pdfUrl) {
    return (
      <p className='nhsuk-body'>
        No preview available. Upload a letter template to see a preview.
      </p>
    );
  }

  return (
    <iframe
      src={pdfUrl}
      title={`Letter preview - ${variant} examples`}
      referrerPolicy='no-referrer'
    />
  );
}
