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

  // was the force flag set on the previous render?
  const alreadyForcedRef = useRef(forcePolling);

  // did forced polling end on the previous render?
  const staleTemplateRef = useRef<AuthoringLetterTemplate | null>(null);

  useEffect(() => {
    // transition from non-polling state to forced polling
    if (!alreadyForcedRef.current && forcePolling && !isPolling) {
      setIsPolling(true);
    }

    // Polling is no longer forced, track template ref, waiting for fresh data
    if (alreadyForcedRef.current && !forcePolling) {
      staleTemplateRef.current = template;
    }

    alreadyForcedRef.current = forcePolling;

    // template has updated, clear the ref so polling can end
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

  return { isPolling: isPolling || forcePolling };
}
