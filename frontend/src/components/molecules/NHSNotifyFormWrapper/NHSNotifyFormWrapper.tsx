'use client';

import {
  type DetailedHTMLProps,
  type PropsWithChildren,
  type FormHTMLAttributes,
  startTransition,
} from 'react';
import { redirect } from 'next/navigation';
import { useCookies } from 'next-client-cookies';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import type { ServerAction } from 'nhs-notify-web-template-management-utils';

export const csrfServerAction = (action: ServerAction) => {
  if (typeof action === 'string') {
    return action;
  }

  return async (formData: FormData) => {
    const valid = await verifyFormCsrfToken(formData);

    if (!valid) {
      return redirect('/auth/signout');
    }

    return startTransition(() => {
      action(formData);
    });
  };
};

export type NHSNotifyFormWrapperProps = {
  action: string | ((payload: FormData) => void);
  formId: string;
  formAttributes?: DetailedHTMLProps<
    FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >;
};

export const NHSNotifyFormWrapper = ({
  children,
  action,
  formId,
  formAttributes = {},
}: PropsWithChildren<NHSNotifyFormWrapperProps>) => {
  const cookies = useCookies();
  const csrfToken = cookies.get('csrf_token');

  return (
    <form action={csrfServerAction(action)} {...formAttributes}>
      <input type='hidden' name='form-id' value={formId} readOnly />
      <input
        type='hidden'
        name='csrf_token'
        value={csrfToken ?? 'no_token'}
        readOnly
      />
      {children}
    </form>
  );
};
