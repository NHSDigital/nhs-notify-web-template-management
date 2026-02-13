'use client';

import {
  type PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from 'react';
import type { FormState } from 'nhs-notify-web-template-management-utils';

type NHSNotifyFormActionState<T extends FormState = FormState> = ReturnType<
  typeof useActionState<T, FormData>
>;

const FormContext = createContext<NHSNotifyFormActionState | null>(null);

export function useNHSNotifyForm<
  T extends FormState = FormState,
>(): NHSNotifyFormActionState<T> {
  const context = useContext(FormContext);
  if (!context)
    throw new Error(
      'useNHSNotifyForm must be used within NHSNotifyFormProvider'
    );

  return context as NHSNotifyFormActionState<T>;
}

export function NHSNotifyFormProvider<T extends FormState = FormState>({
  children,
  initialState,
  serverAction,
}: PropsWithChildren<{
  initialState?: T;
  serverAction: (state: T, data: FormData) => Promise<T>;
}>) {
  const [state, action, isPending] = useActionState<T, FormData>(
    serverAction,
    (initialState ?? {}) as Awaited<T>
  );

  return (
    <FormContext.Provider
      value={[state, action, isPending] as NHSNotifyFormActionState}
    >
      {children}
    </FormContext.Provider>
  );
}
