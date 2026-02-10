'use client';

import {
  NhsNotifyErrorSummary as ErrorSummary,
  NhsNotifyErrorSummaryProps,
} from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyFormErrorSummary(
  props: Omit<NhsNotifyErrorSummaryProps, 'errorState'>
) {
  const [state] = useNHSNotifyForm();

  return <ErrorSummary {...props} errorState={state.errorState} />;
}
