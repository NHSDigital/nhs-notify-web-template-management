import { PropsWithChildren } from 'react';
import styles from './FormSection.module.scss';

export const FormSection = ({ children }: PropsWithChildren) => (
  <div className={styles.border}>{children}</div>
);
