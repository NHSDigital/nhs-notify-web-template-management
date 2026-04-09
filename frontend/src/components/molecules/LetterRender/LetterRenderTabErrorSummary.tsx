'use client';

import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

export function LetterRenderTabErrorSummary() {
  const { tabErrorState } = useLetterRenderPolling();

  return <NhsNotifyErrorSummary errorState={tabErrorState} />;
}
