import type { PropsWithChildren } from 'react';
import styles from './MessagePlanChannelList.module.scss';

export function MessagePlanChannelList({ children }: PropsWithChildren) {
  return <ul className={styles['channel-list']}>{children}</ul>;
}
