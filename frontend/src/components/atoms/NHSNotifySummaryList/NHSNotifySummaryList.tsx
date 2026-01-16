'use client';

import type { HTMLProps, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { SummaryList } from 'nhsuk-react-components';
import styles from './NHSNotifySummaryList.module.scss';

interface SummaryListProps extends HTMLProps<HTMLDListElement> {
  noBorder?: boolean;
}

export function NHSNotifySummaryList({
  children,
  className,
  ...props
}: PropsWithChildren<SummaryListProps>) {
  return (
    <SummaryList
      {...props}
      className={classNames(styles.nhs_notify_summary_list, className)}
    >
      {children}
    </SummaryList>
  );
}

export const NHSNotifySummaryListRow = SummaryList.Row;

export function NHSNotifySummaryListKey({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLProps<HTMLDListElement>>) {
  return (
    <SummaryList.Key
      {...props}
      className={classNames(styles.nhs_notify_summary_list__key, className)}
    >
      {children}
    </SummaryList.Key>
  );
}

export function NHSNotifySummaryListValue({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLProps<HTMLDListElement>>) {
  return (
    <SummaryList.Value
      {...props}
      className={classNames(styles.nhs_notify_summary_list__value, className)}
    >
      {children}
    </SummaryList.Value>
  );
}
