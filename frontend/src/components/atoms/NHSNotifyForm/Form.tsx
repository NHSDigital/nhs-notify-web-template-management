'use client';

import type { HTMLProps } from 'react';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyForm({
  children,
  formId,
  ...props
}: Omit<HTMLProps<HTMLFormElement>, 'action'> & { formId: string }) {
  const [, action] = useNHSNotifyForm();

  return (
    <NHSNotifyFormWrapper {...props} action={action} formId={formId}>
      {children}
    </NHSNotifyFormWrapper>
  );
}
