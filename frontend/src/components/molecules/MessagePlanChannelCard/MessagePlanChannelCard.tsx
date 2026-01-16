import type { HTMLProps, PropsWithChildren } from 'react';
import classNames from 'classnames';
import styles from './MessagePlanChannelCard.module.scss';

export function MessagePlanChannelCard({
  children,
  className,
  heading,
  ...props
}: PropsWithChildren<HTMLProps<HTMLDivElement> & { heading: string }>) {
  return (
    <div
      {...props}
      className={classNames(styles['channel-template-outer'], className)}
    >
      <div className={styles['channel-template-inner']}>
        <h3 className='nhsuk-heading-s'>{heading}</h3>
        {children}
      </div>
    </div>
  );
}
