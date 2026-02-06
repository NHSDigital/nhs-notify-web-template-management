'use client';

import type { HTMLProps } from 'react';
import classNames from 'classnames';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyFormGroup({
  children,
  className,
  htmlFor,
  ...props
}: HTMLProps<HTMLDivElement> & { htmlFor?: string }) {
  const [state] = useNHSNotifyForm();

  const error = Boolean(
    htmlFor && state.errorState?.fieldErrors?.[htmlFor]?.length
  );

  return (
    <div
      className={classNames('nhsuk-form-group', className, {
        'nhsuk-form-group--error': error,
      })}
      {...props}
    >
      {children}
    </div>
  );
}
