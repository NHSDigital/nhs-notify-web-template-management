import type { RenderKey } from '@utils/types';
import content from '@content/content';

type LetterRenderIframeProps = {
  renderType: RenderKey;
  pdfUrl: string | null;
} & React.ComponentProps<'iframe'>;

export function LetterRenderIframe({
  renderType,
  pdfUrl,
  ...rest
}: LetterRenderIframeProps) {
  if (!pdfUrl) {
    return (
      <p className='nhsuk-body'>
        {content.components.letterRender.iframe.noPreview}
      </p>
    );
  }

  const { title, ariaLabel } = content.components.letterRender.iframe;

  return (
    <iframe
      src={pdfUrl}
      title={title[renderType]}
      aria-label={ariaLabel[renderType]}
      {...rest}
    />
  );
}
