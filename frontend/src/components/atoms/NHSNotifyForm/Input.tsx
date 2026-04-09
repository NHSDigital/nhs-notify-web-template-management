'use client';

import type { HTMLProps } from 'react';
import classNames from 'classnames';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyFormInput({
  className,
  id,
  name,
  ...props
}: Omit<HTMLProps<HTMLInputElement>, 'defaultValue'> & {
  id: string;
  name: string;
}) {
  const [state] = useNHSNotifyForm();

  const error = Boolean(state.errorState?.fieldErrors?.[id]?.length);

  return (
    <input
      id={id}
      name={name}
      className={classNames(
        'nhsuk-input',
        { 'nhsuk-input--error': error },
        className
      )}
      defaultValue={state.fields?.[name]}
      {...props}
    />
  );
}
