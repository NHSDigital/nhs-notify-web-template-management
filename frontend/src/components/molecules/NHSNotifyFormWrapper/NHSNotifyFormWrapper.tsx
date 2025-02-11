import {
  DetailedHTMLProps,
  PropsWithChildren,
  FormHTMLAttributes,
} from 'react';
import { verifyCsrfTokenFull } from '@utils/csrf-utils';
import { ServerAction } from 'nhs-notify-web-template-management-utils';

export type NHSNotifyFormWrapperProps = {
  formId: string;
  action: string | ((payload: FormData) => void);
  csrfToken: string;
  formAttributes?: DetailedHTMLProps<
    FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >;
};

export const csrfServerAction = (action: ServerAction) => {
  if (typeof action === 'string') {
    return action;
  }

  return async (formData: FormData) => {
    await verifyCsrfTokenFull(formData);

    return action(formData);
  };
};

export const NHSNotifyFormWrapper = ({
  children,
  action,
  formId,
  csrfToken,
  formAttributes = {},
}: PropsWithChildren<NHSNotifyFormWrapperProps>) => (
  <form action={csrfServerAction(action)} {...formAttributes}>
    <input type='hidden' name='form-id' value={formId} readOnly />
    <input type='hidden' name='csrf_token' value={csrfToken} readOnly />
    {children}
  </form>
);
