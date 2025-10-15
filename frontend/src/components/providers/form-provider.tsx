'use client';

import React, {
  type PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from 'react';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

type Ctx = [FormState, (formData: FormData) => void];

const FormCtx = createContext<Ctx | null>(null);

export function useNHSNotifyForm() {
  const ctx = useContext(FormCtx);
  if (!ctx)
    throw new Error(
      'useNHSNotifyForm must be used within NHSNotifyFormProvider'
    );
  return ctx;
}

export function NHSNotifyFormProvider({
  children,
  initialState = {},
  serverAction,
}: PropsWithChildren<{
  initialState?: FormState;
  serverAction: (state: FormState, data: FormData) => Promise<FormState>;
}>) {
  const [state, action] = useActionState<FormState, FormData>(
    serverAction,
    initialState
  );

  return (
    <FormCtx.Provider value={[state, action]}>
      <NhsNotifyErrorSummary errorState={state.errorState} />
      {children}
    </FormCtx.Provider>
  );
}
