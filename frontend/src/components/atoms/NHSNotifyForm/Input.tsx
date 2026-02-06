'use client';

import type { HTMLProps } from 'react';
import classNames from 'classnames';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyInput({
  className,
  name,
  ...props
}: Omit<HTMLProps<HTMLInputElement>, 'defaultValue'>) {
  const [state] = useNHSNotifyForm();

  return (
    <input
      name={name}
      className={classNames('nhsuk-input', className)}
      defaultValue={name && state.fields?.[name]}
      {...props}
    />
  );
}
