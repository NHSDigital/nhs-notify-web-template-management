import styles from './PageBreak.module.scss';

export function PageBreak() {
  return (
    <div className={styles.pagebreak} data-testid='page-break'>
      <div className={styles.pagebreak__divider} />
      <span
        className={styles.pagebreak__text}
        data-testid='page-break__content'
      >
        Page Break
      </span>
      <div className={styles.pagebreak__divider} />
    </div>
  );
}
