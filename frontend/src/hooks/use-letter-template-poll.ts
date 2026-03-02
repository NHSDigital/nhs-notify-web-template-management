'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

export const RENDER_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 2000;

export function useLetterTemplatePoll({
  template,
  shouldPoll,
}: {
  template: AuthoringLetterTemplate;
  shouldPoll: (template: AuthoringLetterTemplate) => boolean;
}) {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(() => shouldPoll(template));
  const [isTimedOut, setIsTimedOut] = useState(false);

  const shouldPollRef = useRef(shouldPoll);
  shouldPollRef.current = shouldPoll;

  const templateRef = useRef(template);
  templateRef.current = template;

  useEffect(() => {
    if (!isPolling) return;

    const pollTimerId = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);

    const timeoutTimerId = setTimeout(() => {
      setIsPolling(false);
      setIsTimedOut(true);
    }, RENDER_TIMEOUT_MS);

    return () => {
      clearInterval(pollTimerId);
      clearTimeout(timeoutTimerId);
    };
  }, [isPolling, router]);

  useEffect(() => {
    if (isPolling && !shouldPollRef.current(templateRef.current)) {
      setIsPolling(false);
    }
  }, [template, isPolling]);

  return { isPolling, isTimedOut };
}
