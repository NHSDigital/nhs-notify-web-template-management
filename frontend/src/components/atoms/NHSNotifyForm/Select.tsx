'use client';

import type { HTMLProps } from 'react';
import classNames from 'classnames';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyFormSelect({
  children,
  className,
  id,
  name,
  ...props
}: Omit<HTMLProps<HTMLSelectElement>, 'defaultValue'> & {
  id: string;
  name: string;
}) {
  const [state] = useNHSNotifyForm();

  const error = Boolean(state.errorState?.fieldErrors?.[id]?.length);

  return (
    <select
      className={classNames(
        'nhsuk-select',
        {
          'nhsuk-select--error': error,
        },
        className
      )}
      defaultValue={state.fields?.[name]}
      key={state.fields?.[name]}
      id={id}
      name={name}
      {...props}
    >
      {children}
    </select>
  );
}
