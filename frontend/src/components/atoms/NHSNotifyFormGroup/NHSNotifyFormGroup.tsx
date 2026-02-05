import classNames from 'classnames';
import { HTMLProps } from 'react';

export function NHSNotifyFormGroup({
  children,
  className,
  error,
  ...props
}: HTMLProps<HTMLDivElement> & { error: boolean }) {
  return (
    <div
      className={classNames(
        'nhsuk-form-group',
        'nhsuk-u-margin-bottom-6',
        {
          'nhsuk-form-group--error': error,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
