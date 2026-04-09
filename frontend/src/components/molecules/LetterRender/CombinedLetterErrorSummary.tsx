'use client';

import { useEffect } from 'react';
import { useNHSNotifyForm } from '@providers/form-provider';
import { useLetterRenderError } from '@providers/letter-render-error-provider';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

/**
 * Syncs the outer page-level form state into
 * CombinedLetterErrorSummary so it can be displayed and cleared independently
 * of letter render errors.
 *
 * This mechanism is intentionally NOT used for letterRenderErrorState — that should be
 * handled via the parent form submit's onClick to avoid interfering with initial mount.
 */
function ParentFormErrorSyncer() {
  const [state] = useNHSNotifyForm();
  const { setParentErrorState } = useLetterRenderError();

  useEffect(() => {
    setParentErrorState(state.errorState);
  }, [state, setParentErrorState]);

  return null;
}

/**
 * Displays validation errors for the preview letter template page.
 * Approve template and Update preview errors occupy separate slots so each
 * button's onClick can clear only its own errors.
 *
 * Must be rendered inside NHSNotifyFormProvider (for the parent action state)
 * and LetterRenderErrorProvider.
 */
export function CombinedLetterErrorSummary() {
  const { parentErrorState, letterRenderErrorState } = useLetterRenderError();

  return (
    <>
      <ParentFormErrorSyncer />
      <NhsNotifyErrorSummary
        errorState={parentErrorState || letterRenderErrorState}
      />
    </>
  );
}
