'use client';

import type { HTMLProps } from 'react';
import classNames from 'classnames';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifySelect({
  children,
  className,
  name,
  ...props
}: Omit<HTMLProps<HTMLSelectElement>, 'defaultValue'>) {
  const [state] = useNHSNotifyForm();

  const error = Boolean(name && state.errorState?.fieldErrors?.[name]?.length);

  return (
    <select
      className={classNames(
        'nhsuk-select',
        {
          'nhsuk-select--error': error,
        },
        className
      )}
      defaultValue={name && state.fields?.[name]}
      key={name && state.fields?.[name]}
      name={name}
      {...props}
    >
      {children}
    </select>
  );
}
