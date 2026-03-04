'use client';

import type { PropsWithChildren, ReactNode } from 'react';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';
import {
  useLetterTemplatePoll,
  RENDER_TIMEOUT_MS,
} from '@hooks/use-letter-template-poll';
import type { RenderKey } from '@utils/types';

export function shouldPollRender(
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

type RenderPollProps = PropsWithChildren<{
  template: AuthoringLetterTemplate;
  mode: RenderKey;
  loadingElement: ReactNode;
}>;

export function RenderPoll({
  template,
  children,
  mode,
  loadingElement,
}: Readonly<RenderPollProps>) {
  const { isPolling } = useLetterTemplatePoll({
    template,
    shouldPoll: shouldPollRender(mode),
  });

  if (isPolling) {
    return <LoadingSpinner>{loadingElement}</LoadingSpinner>;
  }

  return <>{children}</>;
}
