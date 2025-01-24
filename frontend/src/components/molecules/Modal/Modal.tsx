'use client';

import styles from './Modal.module.scss';

const Modal = ({
  showModal,
  children,
}: {
  showModal: boolean;
  children: React.ReactNode;
}) => {
  return showModal ? (
    <div
      className={styles.modal}
      role='alertdialog'
      aria-modal='true'
      aria-live='assertive'
      aria-labelledby='idle-warning-heading'
    >
      <div className={styles.modal__content}>{children}</div>
    </div>
  ) : null;
};

const Header = ({ children }: { children: React.ReactNode }) => (
  <div id='idle-warning-heading' className={styles.modal__heading}>
    <p>{children}</p>
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
