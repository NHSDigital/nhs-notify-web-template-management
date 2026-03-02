import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner({ text }: Readonly<{ text: string }>) {
  return (
    <div className={styles['nhsuk-loader']} role='status' aria-live='polite'>
      <span className={styles['nhsuk-loader__spinner']} aria-hidden='true' />
      <h1 className={styles['nhsuk-loader__text']}>{text}</h1>
    </div>
  );
}
