import content from '@content/content';

type IframeProps = React.ComponentProps<'iframe'>;
type LetterRenderIframeProps = IframeProps &
  Required<Pick<IframeProps, 'title' | 'aria-label'>>;

export function LetterRenderIframe(props: LetterRenderIframeProps) {
  if (!props.src)
    return (
      <p className='nhsuk-body'>
        {content.components.letterRenderIframe.noPreviewAvailable}
      </p>
    );

  return <iframe {...props} title={props.title} />;
}
