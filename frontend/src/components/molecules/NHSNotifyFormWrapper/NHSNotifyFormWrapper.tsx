import type {
  DetailedHTMLProps,
  PropsWithChildren,
  FormHTMLAttributes,
} from 'react';
import { useCookies } from 'next-client-cookies';
import { verifyCsrfTokenFull } from '@utils/csrf-utils';
import type { ServerAction } from 'nhs-notify-web-template-management-utils';

export const csrfServerAction = (action: ServerAction) => {
  if (typeof action === 'string') {
    return action;
  }

  return async (formData: FormData) => {
    await verifyCsrfTokenFull(formData);

    return action(formData);
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
