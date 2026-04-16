'use client';

import { useEffect } from 'react';
import { useNHSNotifyForm } from '@providers/form-provider';
import { useLetterRenderError } from '@providers/letter-render-error-provider';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

/**
 * Displays validation errors for both the letter rendering component and a parent form.
 * Error state is stored in LetterRenderErrorProvider so it can be cleared when either form is submitted.
 *
 * Must be rendered inside NHSNotifyFormProvider (for the parent action state)
 * and LetterRenderErrorProvider.
 */
export function CombinedLetterErrorSummary() {
  const [state] = useNHSNotifyForm();

  const { setParentErrorState, parentErrorState, letterRenderErrorState } =
    useLetterRenderError();

  useEffect(() => {
    setParentErrorState(state.errorState);
  }, [state, setParentErrorState]);

  return (
    <NhsNotifyErrorSummary
      errorState={parentErrorState || letterRenderErrorState}
    />
  );
}
