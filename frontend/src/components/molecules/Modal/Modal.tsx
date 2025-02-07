'use client';

import { useEffect, useRef } from 'react';
import styles from './Modal.module.scss';

const Modal = ({
  showModal,
  children,
}: {
  showModal: boolean;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (showModal) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [showModal]);

  return (
    <dialog
      className={styles.modal}
      ref={ref}
      role='alertdialog'
      aria-modal='true'
      aria-live='assertive'
      aria-labelledby='modal-heading'
    >
      <div className={styles.modal__content}>{children}</div>
    </dialog>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => (
  <div
    id='modal-heading'
    data-testid='modal-header'
    className={styles.modal__heading}
  >
    {children}
  </div>
);

const Body = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.modal__body}>{children}</div>
);

const Footer = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.modal__footer}>{children}</div>
);

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export { Modal };
