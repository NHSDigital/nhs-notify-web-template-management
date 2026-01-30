import type { HTMLProps, PropsWithChildren } from 'react';
import classNames from 'classnames';
import styles from './NHSNotifyWarningCallout.module.scss';

export function NHSNotifyWarningCallout({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
  return (
    <div
      className={classNames(
        styles.nhs_notify_warning_callout,
        'nhsuk-u-padding-4',
        'nhsuk-u-margin-bottom-6',
        'nhsuk-u-reading-width',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
