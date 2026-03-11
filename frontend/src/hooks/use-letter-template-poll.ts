'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

export const RENDER_TIMEOUT_MS = 20_000;
export const POLL_INTERVAL_MS = 2000;

export function useLetterTemplatePoll({
  template,
  shouldPoll,
  forcePolling = false,
}: {
  template: AuthoringLetterTemplate;
  shouldPoll: (template: AuthoringLetterTemplate) => boolean;
  forcePolling?: boolean;
}) {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(
    () => forcePolling || shouldPoll(template)
  );

  const shouldPollRef = useRef(shouldPoll);
  shouldPollRef.current = shouldPoll;

  const prevForcePollingRef = useRef(forcePolling);

  const staleTemplateRef = useRef<AuthoringLetterTemplate | null>(null);

  useEffect(() => {
    if (!prevForcePollingRef.current && forcePolling && !isPolling) {
      setIsPolling(true);
    }

    if (prevForcePollingRef.current && !forcePolling) {
      staleTemplateRef.current = template;
    }

    prevForcePollingRef.current = forcePolling;

    if (staleTemplateRef.current && staleTemplateRef.current !== template) {
      staleTemplateRef.current = null;
    }

    if (
      isPolling &&
      !forcePolling &&
      !staleTemplateRef.current &&
      !shouldPollRef.current(template)
    ) {
      setIsPolling(false);
    }
  }, [template, forcePolling, isPolling]);

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

  return { isPolling };
}
