'use client';

import { type PropsWithChildren, type ReactNode, useEffect } from 'react';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';
import {
  useLetterTemplatePoll,
  RENDER_TIMEOUT_MS,
} from '@hooks/use-letter-template-poll';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';
import type { RenderKey } from '@utils/types';

function shouldPollLetterRender(
  mode: RenderKey
): (template: AuthoringLetterTemplate) => boolean {
  return ({ files, templateStatus }: AuthoringLetterTemplate): boolean => {
    const render = files[mode];

    if (
      render?.status !== 'PENDING' ||
      templateStatus === 'VALIDATION_FAILED'
    ) {
      return false;
    }

    const elapsed = Date.now() - new Date(render.requestedAt).getTime();

    return elapsed < RENDER_TIMEOUT_MS;
  };
}

type PollLetterRenderProps = PropsWithChildren<{
  template: AuthoringLetterTemplate;
  mode: RenderKey;
  loadingElement: ReactNode;
  forcePolling?: boolean;
}>;

export function PollLetterRender({
  template,
  children,
  mode,
  loadingElement,
  forcePolling,
}: Readonly<PollLetterRenderProps>) {
  const { isPolling } = useLetterTemplatePoll({
    template,
    shouldPoll: shouldPollLetterRender(mode),
    forcePolling,
  });

  const { registerPolling } = useLetterRenderPolling();

  useEffect(() => {
    registerPolling(mode, isPolling);

    return () => {
      registerPolling(mode, false);
    };
  }, [mode, isPolling, registerPolling]);

  if (isPolling) {
    return <LoadingSpinner>{loadingElement}</LoadingSpinner>;
  }

  return <>{children}</>;
}
