import { JSX } from 'react';
import styles from './Filename.module.scss';

export function Filename({ filename }: { filename: string }): JSX.Element {
  return (
    <div className={styles.container}>
      <svg
        className={styles.icon}
        width='20'
        height='26'
        viewBox='0 0 20 26'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M0 0V26H20V6.59375L19.7188 6.28125L13.7188 0.28125L13.4062 0H0ZM2 2H12V8H18V24H2V2ZM14 3.4375L16.5625 6H14V3.4375Z'
          fill='#4C6272'
        />
      </svg>
      <div>{filename}</div>
    </div>
  );
}
