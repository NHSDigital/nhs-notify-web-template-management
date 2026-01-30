import type { HTMLProps, PropsWithChildren } from 'react';
import styles from './MessagePlanChannelList.module.scss';
import classNames from 'classnames';

export function MessagePlanChannelList({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLProps<HTMLUListElement>>) {
  return (
    <ul className={classNames(styles['channel-list'], className)} {...props}>
      {children}
    </ul>
  );
}
