import type { PersonalisedRenderKey } from '@utils/types';

type LetterRenderIframeProps = {
  tab: PersonalisedRenderKey;
  pdfUrl: string | null;
};

export function LetterRenderIframe({ tab, pdfUrl }: LetterRenderIframeProps) {
  if (!pdfUrl) return <p className='nhsuk-body'>No preview available</p>;
  const tabDescription = tab === 'shortFormRender' ? 'short' : 'long';

  return (
    <>
      <p>{pdfUrl}</p>
      <iframe
        src={pdfUrl}
        title={`Letter preview - ${tabDescription} examples`}
        aria-label={`PDF preview of letter template with ${tabDescription} example personalisation data`}
      />
    </>
  );
}
