'use client';

import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

export function LetterRenderPageErrorSummary() {
  const { pageErrorState } = useLetterRenderPolling();

  return <NhsNotifyErrorSummary errorState={pageErrorState} />;
}
