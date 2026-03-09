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

  const templateRef = useRef(template);
  templateRef.current = template;

  const timedOutRef = useRef(false);

  // When forcePolling transitions to true, restart polling (unless timed out).
  // When forcePolling transitions to false, reset the timedOut flag so a
  // future forcePolling=true cycle can start fresh.
  useEffect(() => {
    if (forcePolling && !isPolling && !timedOutRef.current) {
      setIsPolling(true);
    }

    if (!forcePolling) {
      timedOutRef.current = false;
    }
  }, [forcePolling, isPolling]);

  useEffect(() => {
    if (!isPolling) return;

    const pollTimerId = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);

    const timeoutTimerId = setTimeout(() => {
      timedOutRef.current = true;
      setIsPolling(false);
    }, RENDER_TIMEOUT_MS);

    return () => {
      clearInterval(pollTimerId);
      clearTimeout(timeoutTimerId);
    };
  }, [isPolling, router]);

  useEffect(() => {
    if (
      isPolling &&
      !forcePolling &&
      !shouldPollRef.current(templateRef.current)
    ) {
      setIsPolling(false);
    }
  }, [template, isPolling, forcePolling]);

  return { isPolling };
}
