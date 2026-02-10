import React from 'react';
import styles from './NHSNotifyMainFluid.module.scss';

export function NHSNotifyMainFluid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={styles.mainFluid} id='maincontent' role='main'>
      {children}
    </main>
  );
}
