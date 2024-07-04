import { PropsWithChildren } from 'react';

export type NHSNotifyFormWrapperProps = {
  formId: string;
  action: string | ((payload: FormData) => void);
};

export const NHSNotifyFormWrapper = ({
  children,
  action,
  formId,
}: PropsWithChildren<NHSNotifyFormWrapperProps>) => (
  <form action={action}>
    <input type='hidden' name='form-id' value={formId} readOnly={true} />
    {children}
  </form>
);
