'use client';

import { useEffect } from 'react';
import { useNHSNotifyForm } from '@providers/form-provider';
import { useLetterPreviewError } from '@providers/letter-preview-error-provider';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

/**
 * Syncs the outer page-level form state (Approve template action) into
 * LetterPreviewErrorProvider so it can be displayed and cleared independently
 * of the Update Preview errors.
 *
 * Intentionally does NOT cross-clear updatePreviewErrorState here — that is
 * handled via the Approve button's onClick to avoid interfering with initial mount.
 */
function ApproveTemplateErrorSyncer() {
  const [state] = useNHSNotifyForm();
  const { setApproveErrorState } = useLetterPreviewError();

  useEffect(() => {
    setApproveErrorState(state.errorState);
  }, [state, setApproveErrorState]);

  return null;
}

/**
 * Displays validation errors for the preview letter template page.
 * Approve template and Update preview errors occupy separate slots so each
 * button's onClick can clear only its own errors.
 *
 * Must be rendered inside NHSNotifyFormProvider (for the approve action state)
 * and LetterPreviewErrorProvider.
 */
export function LetterPreviewErrors() {
  const { approveErrorState, updatePreviewErrorState } =
    useLetterPreviewError();

  return (
    <>
      <ApproveTemplateErrorSyncer />
      <NhsNotifyErrorSummary errorState={approveErrorState} />
      <NhsNotifyErrorSummary errorState={updatePreviewErrorState} />
    </>
  );
}
