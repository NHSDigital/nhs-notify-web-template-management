import type { ReactNode } from 'react';
import clsx from 'clsx';
import { useJsEnabled } from './use-js-enabled.hook';
import styles from './JsEnabled.module.scss';

export const JsEnabled = ({ children }: { children: ReactNode }) => {
  const jsEnabled = useJsEnabled();

  return (
    <div className={clsx({ [styles['js-enabled__js-disabled']]: !jsEnabled })}>
      {children}
    </div>
  );
};
