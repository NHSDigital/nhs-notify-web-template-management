'use client';

import { Button } from 'nhsuk-react-components';
import content from '@content/content';
import { Modal } from '@molecules/Modal/Modal';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useIdle } from '@hooks/use-idle.hook';
import styles from './LogoutWarningModal.module.scss';

export const LogoutWarningModal = () => {
  const {
    links: { logOut },
  } = content.components.headerComponent;

  const { authStatus, signOut, toSignIn } = useAuthenticator((ctx) => [
    ctx.authStatus,
  ]);

  const isAuthenticated = authStatus === 'authenticated';

  const showWarning = useIdle(5000) && isAuthenticated;

  const shouldSignOut = useIdle(6000) && isAuthenticated;

  if (shouldSignOut) {
    signOut();
    toSignIn();
  }

  return (
    <Modal showModal={showWarning}>
      <Modal.Header>
        For security reasons, you&apos;ll be signed out in 2 minutes.
      </Modal.Header>
      <Modal.Body>
        <p>If you are signed out, your template will not be saved.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button className={styles.signIn}>Stay signed in</Button>
        <div className={styles.signOut}>
          <a onClick={signOut} href={logOut.href}>
            Sign out
          </a>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
