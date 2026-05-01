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
  mode: RenderKey,
  startPollingTimestamp: string | undefined
): boolean {
  const now = Date.now();
  const render = template.files[mode];

  // do not poll if validation failed
  if (template.templateStatus === 'VALIDATION_FAILED') {
    return false;
  }

  // poll if render is in a PENDING state and isn't old
  if (render?.status === 'PENDING') {
    const elapsed = now - new Date(render.requestedAt).getTime();

    return elapsed < RENDER_TIMEOUT_MS;
  }

  // poll if render is not in a PENDING state and hasn't been updated since the last poll start
  if (
    startPollingTimestamp &&
    new Date(startPollingTimestamp).getTime() >
      new Date(template.updatedAt).getTime() &&
    now - new Date(startPollingTimestamp).getTime() < RENDER_TIMEOUT_MS
  ) {
    return true;
  }

  return false;
}

type PollLetterRenderProps = PropsWithChildren<{
  template: AuthoringLetterTemplate;
  mode: RenderKey;
  loadingElement: ReactNode;
  startPollingTimestamp?: string;
}>;

export function PollLetterRender({
  template,
  children,
  mode,
  loadingElement,
  startPollingTimestamp,
}: Readonly<PollLetterRenderProps>) {
  const router = useRouter();
  const { registerPolling } = useLetterRenderPolling();

  const [isPolling, setIsPolling] = useState(
    templateRequiresPolling(template, mode, startPollingTimestamp)
  );

  const startPollingRef = useRef(startPollingTimestamp);

  useEffect(() => {
    if (startPollingRef.current !== startPollingTimestamp) {
      startPollingRef.current = startPollingTimestamp;

      if (!isPolling) {
        setIsPolling(true);
      }
    }

    if (
      isPolling &&
      !templateRequiresPolling(template, mode, startPollingTimestamp)
    ) {
      setIsPolling(false);
    }
  }, [template, isPolling, mode, startPollingTimestamp]);

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
