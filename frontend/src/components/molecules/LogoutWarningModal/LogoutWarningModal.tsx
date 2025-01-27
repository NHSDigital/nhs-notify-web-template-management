'use client';

import { useState } from 'react';
import { Button } from 'nhsuk-react-components';
import { Modal } from '@molecules/Modal/Modal';
import { useRouter } from 'next/navigation';
import { useIdleTimer } from 'react-idle-timer';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@content/content';
import { fetchAuthSession } from 'aws-amplify/auth';
import styles from './LogoutWarningModal.module.scss';

export const LogoutWarningModal = ({
  timeTillPromptInSeconds,
  timeTillLogoutInSeconds,
}: {
  timeTillPromptInSeconds: number;
  timeTillLogoutInSeconds: number;
}) => {
  const {
    headerComponent: {
      links: { logOut },
    },
    logoutWarningComponent,
  } = content.components;

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const authenticated = authStatus === 'authenticated';

  const idle = () => {
    if (authenticated) {
      setShowModal(false);
      router.push('/auth/inactive');
    }
  };

  const prompted = () => {
    if (authenticated) {
      setShowModal(true);
    }
  };

  const { activate, getRemainingTime } = useIdleTimer({
    timeout: timeTillLogoutInSeconds * 1000,
    promptBeforeIdle: timeTillPromptInSeconds * 1000,
    onPrompt: prompted,
    onIdle: idle,
  });

  const stillHere = () => {
    activate();
    setShowModal(false);
    fetchAuthSession({ forceRefresh: true });
  };

  return (
    <Modal showModal={showModal}>
      <Modal.Header>
        {logoutWarningComponent.heading} - {getRemainingTime()}
      </Modal.Header>
      <Modal.Footer>
        <Button className={styles.signIn} onClick={stillHere}>
          {logoutWarningComponent.signIn}
        </Button>
        <div className={styles.signOut}>
          <a href={logOut.href}>{logOut.text}</a>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
