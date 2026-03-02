'use client';

import { useEffect, useRef, useState } from 'react';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { getBasePath } from '@utils/get-base-path';

const DEFAULT_INTERVAL_MS = 1500;
export const DEFAULT_TIMEOUT_MS = 20_000;

type UseTemplatePollOptions = {
  templateId: string;
  shouldPoll: (template: TemplateDto) => boolean;
  onUpdate: (template: TemplateDto) => void;
  enabled?: boolean;
  intervalMs?: number;
  timeoutMs?: number;
};

type UseTemplatePollResult = {
  isPolling: boolean;
  isTimedOut: boolean;
};

async function fetchTemplate(
  templateId: string,
  signal: AbortSignal
): Promise<TemplateDto | null> {
  const basePath = getBasePath();
  const response = await fetch(
    `${basePath}/preview-letter-template/${templateId}/poll`,
    { cache: 'no-store', signal }
  );

  if (!response.ok) return null;

  return (await response.json()) as TemplateDto;
}

export function useTemplatePoll({
  templateId,
  shouldPoll,
  onUpdate,
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: UseTemplatePollOptions): UseTemplatePollResult {
  const [isPolling, setIsPolling] = useState(enabled);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Keep callbacks in refs so the effect doesn't re-run when they change
  const shouldPollRef = useRef(shouldPoll);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    shouldPollRef.current = shouldPoll;
    onUpdateRef.current = onUpdate;
  }, [shouldPoll, onUpdate]);

  useEffect(() => {
    if (!isPolling) return;

    const abortController = new AbortController();

    const poll = async () => {
      try {
        const template = await fetchTemplate(
          templateId,
          abortController.signal
        );

        if (abortController.signal.aborted) return;

        if (!template) return;

        if (!shouldPollRef.current(template)) {
          setIsPolling(false);
          onUpdateRef.current(template);
          return;
        }
      } catch {
        // Silently ignore fetch errors (abort, network).
        // The timeout will stop polling if the endpoint is unreachable.
      }
    };

    void poll();

    const pollTimerId = setInterval(() => {
      void poll();
    }, intervalMs);

    const timeoutTimerId = setTimeout(() => {
      setIsPolling(false);
      setIsTimedOut(true);
    }, timeoutMs);

    return () => {
      abortController.abort();
      clearInterval(pollTimerId);
      clearTimeout(timeoutTimerId);
    };
  }, [isPolling, templateId, intervalMs, timeoutMs]);

  return { isPolling, isTimedOut };
}
