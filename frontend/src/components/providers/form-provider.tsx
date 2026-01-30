'use client';

import React, {
  type PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from 'react';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

type NHSNotifyFormActionState<T extends Record<string, unknown>> = ReturnType<
  typeof useActionState<FormState<T>, FormData>
>;

export function createNhsNotifyFormContext<
  T extends Record<string, unknown>,
>() {
  const FormContext = createContext<NHSNotifyFormActionState<T> | null>(null);

  function useNHSNotifyForm() {
    const context = useContext(FormContext);
    if (!context) {
      throw new Error(
        'useNHSNotifyForm must be used within NHSNotifyFormProvider'
      );
    }
    return context;
  }

  function NHSNotifyFormProvider({
    children,
    errorSummaryHint,
    initialState = {},
    serverAction,
  }: PropsWithChildren<{
    errorSummaryHint?: string;
    initialState?: FormState<T>;
    serverAction: (
      state: FormState<T>,
      data: FormData
    ) => Promise<FormState<T>>;
  }>) {
    const [state, action, isPending] = useActionState<FormState<T>, FormData>(
      serverAction,
      initialState
    );

    return (
      <FormContext.Provider value={[state, action, isPending]}>
        <NhsNotifyErrorSummary
          errorState={state.errorState}
          hint={errorSummaryHint}
        />
        {children}
      </FormContext.Provider>
    );
  }

  return { NHSNotifyFormProvider, useNHSNotifyForm };
}
