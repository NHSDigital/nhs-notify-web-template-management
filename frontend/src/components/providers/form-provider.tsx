'use client';

import {
  type PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from 'react';
import type { FormState } from 'nhs-notify-web-template-management-utils';

type NHSNotifyFormActionState = ReturnType<
  typeof useActionState<FormState, FormData>
>;

const FormContext = createContext<NHSNotifyFormActionState | null>(null);

export function useNHSNotifyForm() {
  const context = useContext(FormContext);
  if (!context)
    throw new Error(
      'useNHSNotifyForm must be used within NHSNotifyFormProvider'
    );

  return context;
}

export function NHSNotifyFormProvider({
  children,
  initialState = {},
  serverAction,
}: PropsWithChildren<{
  initialState?: FormState;
  serverAction: (state: FormState, data: FormData) => Promise<FormState>;
}>) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    serverAction,
    initialState
  );

  return (
    <FormContext.Provider value={[state, action, isPending]}>
      {children}
    </FormContext.Provider>
  );
}
