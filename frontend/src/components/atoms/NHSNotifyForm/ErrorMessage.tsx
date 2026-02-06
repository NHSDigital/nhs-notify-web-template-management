'use client';

import type { ComponentProps } from 'react';
import { ErrorMessage } from 'nhsuk-react-components';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyErrorMessage({
  className,
  htmlFor,
  ...props
}: Omit<ComponentProps<typeof ErrorMessage>, 'children'> & {
  htmlFor: string;
}) {
  const [state] = useNHSNotifyForm();

  const error = state.errorState?.fieldErrors?.[htmlFor]?.join(',');

  if (error) {
    return <ErrorMessage {...props}>{error}</ErrorMessage>;
  }
}
