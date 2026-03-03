import { ReactNode } from 'react';
import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner({ children }: { children: ReactNode }) {
  return (
    <div className={styles['nhsuk-loader']} role='status' aria-live='polite'>
      <span className={styles['nhsuk-loader__spinner']} aria-hidden='true' />
      <div className={styles['nhsuk-loader__text']}>{children}</div>
    </div>
  );
}
