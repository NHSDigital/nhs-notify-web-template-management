'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';
import type { RenderKey } from '@utils/types';

export const RENDER_TIMEOUT_MS = 20_000;
export const POLL_INTERVAL_MS = 2000;

function templateRequiresPolling(
  template: AuthoringLetterTemplate,
  mode: RenderKey
): boolean {
  const render = template.files[mode];

  if (
    render?.status !== 'PENDING' ||
    template.templateStatus === 'VALIDATION_FAILED'
  ) {
    return false;
  }

  const elapsed = Date.now() - new Date(render.requestedAt).getTime();

  return elapsed < RENDER_TIMEOUT_MS;
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
  forcePolling = false,
}: Readonly<PollLetterRenderProps>) {
  const router = useRouter();
  const { registerPolling } = useLetterRenderPolling();

  const [isPolling, setIsPolling] = useState(
    forcePolling || templateRequiresPolling(template, mode)
  );

  // was the force flag active on the previous render?
  const forcedRef = useRef(forcePolling);

  const staleTemplateRef = useRef<AuthoringLetterTemplate | null>(
    forcePolling ? template : null
  );

  useEffect(() => {
    const forcedPollingBegan = !forcedRef.current && forcePolling;

    if (forcedPollingBegan) {
      // track the template identity from before any updates
      staleTemplateRef.current = template;

      if (!isPolling) {
        setIsPolling(true);
      }
    }

    forcedRef.current = forcePolling;

    const templateHasUpdated =
      staleTemplateRef.current && staleTemplateRef.current !== template;

    if (templateHasUpdated) {
      // clear the ref so once the template is RENDERED, polling can end
      staleTemplateRef.current = null;
    }

    if (
      isPolling &&
      !forcePolling &&
      !staleTemplateRef.current &&
      !templateRequiresPolling(template, mode)
    ) {
      setIsPolling(false);
    }
  }, [template, forcePolling, isPolling, mode]);

  useEffect(() => {
    if (!isPolling) return;

    const pollTimerId = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);

    const timeoutTimerId = setTimeout(() => {
      setIsPolling(false);
    }, RENDER_TIMEOUT_MS);

    return () => {
      clearInterval(pollTimerId);
      clearTimeout(timeoutTimerId);
    };
  }, [isPolling, router]);

  const pollActive = isPolling || forcePolling;

  useEffect(() => {
    registerPolling(mode, pollActive);

    return () => {
      registerPolling(mode, false);
    };
  }, [mode, pollActive, registerPolling]);

  if (pollActive) {
    return <LoadingSpinner>{loadingElement}</LoadingSpinner>;
  }

  return <>{children}</>;
}
