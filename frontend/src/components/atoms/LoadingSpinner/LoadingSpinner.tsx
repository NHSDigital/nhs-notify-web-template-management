import type { PropsWithChildren } from 'react';
import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner({ children }: PropsWithChildren) {
  return (
    <div className={styles['nhsuk-loader']} role='status' aria-live='polite'>
      <span className={styles['nhsuk-loader__spinner']} aria-hidden='true' />
      <div className={styles['nhsuk-loader__text']}>{children}</div>
    </div>
  );
}
