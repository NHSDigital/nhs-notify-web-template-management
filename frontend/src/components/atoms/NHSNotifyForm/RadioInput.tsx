'use client';

import type { HTMLProps } from 'react';
import classNames from 'classnames';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyFormRadioInput({
  className,
  name,
  value,
  ...props
}: Omit<HTMLProps<HTMLInputElement>, 'defaultChecked' | 'type'>) {
  const [state] = useNHSNotifyForm();

  return (
    <input
      type='radio'
      className={classNames('nhsuk-radios__input', className)}
      name={name}
      value={value}
      defaultChecked={Boolean(name && value && value === state.fields?.[name])}
      {...props}
    />
  );
}
