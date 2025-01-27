'use client';

import { Button } from 'nhsuk-react-components';
import content from '@content/content';
import { Modal } from '@molecules/Modal/Modal';
import { useIdle } from '@hooks/use-idle.hook';
import { redirect } from 'next/navigation';
import styles from './LogoutWarningModal.module.scss';

export const LogoutWarningModal = ({
  authenticated,
  warningTimeoutInSeconds,
  autoLogoutInSeconds,
}: {
  authenticated: boolean;
  warningTimeoutInSeconds: number;
  autoLogoutInSeconds: number;
}) => {
  const {
    links: { logOut },
  } = content.components.headerComponent;

  const showWarning = useIdle(warningTimeoutInSeconds) && authenticated;

  const shouldSignOut = useIdle(autoLogoutInSeconds) && authenticated;

  if (shouldSignOut) {
    // return redirect('/auth/inactive');
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
          <a href={logOut.href}>Sign out</a>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
