'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { usePoll } from './use-poll';

export const RENDER_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 2000;

type UseTemplatePollOptions = {
  initialTemplate: AuthoringLetterTemplate;
  shouldPoll: (template: AuthoringLetterTemplate) => boolean;
  onUpdate: (template: AuthoringLetterTemplate) => void;
};

const basePath = getBasePath();

export function useTemplatePoll({
  initialTemplate,
  shouldPoll,
  onUpdate,
}: UseTemplatePollOptions) {
  return usePoll({
    fetchFn: async (signal) => {
      const response = await fetch(
        `${basePath}/preview-letter-template/${initialTemplate.id}/poll`,
        { cache: 'no-store', signal }
      );

      if (!response.ok) return null;

      return (await response.json()) as AuthoringLetterTemplate;
    },
    initialValue: initialTemplate,
    shouldPoll,
    onUpdate,
    intervalMs: POLL_INTERVAL_MS,
    timeoutMs: RENDER_TIMEOUT_MS,
  });
}
