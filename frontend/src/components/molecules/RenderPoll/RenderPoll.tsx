'use client';

import type { PropsWithChildren } from 'react';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';
import content from '@content/content';
import {
  RENDER_TIMEOUT_MS,
  useLetterTemplatePoll,
} from '@hooks/use-letter-template-poll';
import type { RenderKey } from '@utils/types';
import { isRenderAlreadyStale } from '@utils/render-utils';

function buildShouldPoll(mode: RenderKey) {
  return (template: AuthoringLetterTemplate): boolean => {
    const render = template.files[mode];

    return (
      !!render &&
      render.status === 'PENDING' &&
      !isRenderAlreadyStale(render, RENDER_TIMEOUT_MS)
    );
  };
}

type RenderPollProps = PropsWithChildren<{
  template: AuthoringLetterTemplate;
  mode: RenderKey;
}>;

export function RenderPoll({
  template,
  children,
  mode,
}: Readonly<RenderPollProps>) {
  const { loadingText } = content.components.previewLetterTemplate;

  const { isPolling } = useLetterTemplatePoll({
    template,
    shouldPoll: buildShouldPoll(mode),
  });

  if (isPolling) {
    return <LoadingSpinner text={loadingText} />;
  }

  return <>{children}</>;
}
