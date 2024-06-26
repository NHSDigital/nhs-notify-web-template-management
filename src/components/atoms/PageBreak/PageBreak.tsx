import styles from './PageBreak.module.scss';

export function PageBreak() {
  return (
    <div className={styles.pagebreak}>
      <div className={styles.pagebreak__divider} />
      <span className={styles.pagebreak__text}>Page Break</span>
      <div className={styles.pagebreak__divider} />
    </div>
  );
}
