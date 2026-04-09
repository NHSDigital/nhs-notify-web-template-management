'use client';

import { useEffect } from 'react';
import { useNHSNotifyForm } from '@providers/form-provider';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';

/**
 * Syncs the outer page-level form state (Approve template action) into
 * LetterRenderPollingProvider so that LetterRenderPageErrorSummary can
 * display it, and so it can be cleared independently of the tab-level
 * Update Preview errors.
 *
 * Intentionally does NOT cross-clear tabErrorState here — that is handled
 * via the Approve button's onClick to avoid interfering with initial mount.
 */
export function LetterRenderPageErrorSyncer() {
  const [state] = useNHSNotifyForm();
  const { setPageErrorState } = useLetterRenderPolling();

  useEffect(() => {
    setPageErrorState(state.errorState);
  }, [state, setPageErrorState]);

  return null;
}
