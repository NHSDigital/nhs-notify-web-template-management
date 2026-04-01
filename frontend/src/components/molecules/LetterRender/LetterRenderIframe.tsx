import type { RenderKey } from '@utils/types';

type LetterRenderIframeProps = {
  renderType: RenderKey;
  pdfUrl: string | null;
} & React.ComponentProps<'iframe'>;

export function LetterRenderIframe({
  renderType,
  pdfUrl,
  ...rest
}: LetterRenderIframeProps) {
  if (!pdfUrl) return <p className='nhsuk-body'>No preview available</p>;

  const tabName = renderType === 'shortFormRender' ? 'short' : 'long';
  const tabbedViewSuffix =
    renderType === 'initialRender' ? '' : ` - ${tabName} examples`;

  const ariaLabel = `PDF preview of letter template${tabbedViewSuffix}`;

  const title = `Letter preview${tabbedViewSuffix}`;

  return <iframe src={pdfUrl} title={title} aria-label={ariaLabel} {...rest} />;
}
