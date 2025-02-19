'use client';

import { useEffect, useRef, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { Button } from 'nhsuk-react-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter, usePathname } from 'next/navigation';
import { Modal } from '@molecules/Modal/Modal';
import content from '@content/content';
import { getBasePath } from '@utils/get-base-path';
import { formatTime } from './format-time';

import styles from './LogoutWarningModal.module.scss';

// Note: This is 5 seconds because it gives a screen reader a chance to read out the full modal title.
// Whereas with 1 second a screen reader doesn't get a chance to read out the whole modal and is jarring.
const HEADING_UPDATE_INTERVAL = 5000;

export const LogoutWarningModal = ({
  promptBeforeLogoutSeconds,
  logoutInSeconds,
}: {
  promptBeforeLogoutSeconds: number;
  logoutInSeconds: number;
}) => {
  const {
    headerComponent: {
      links: { signOut },
    },
    logoutWarningComponent,
  } = content.components;

  const initialTime = formatTime(promptBeforeLogoutSeconds);

  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const idle = () => {
    router.push(
      `/auth/inactive?redirect=${encodeURIComponent(
        `${getBasePath()}/${pathname}`
      )}`
    );
    setShowModal(false);
  };

  const prompted = () => {
    setShowModal(true);
  };

  const { reset, getRemainingTime } = useIdleTimer({
    timeout: logoutInSeconds * 1000,
    promptBeforeIdle: promptBeforeLogoutSeconds * 1000,
    onPrompt: prompted,
    onIdle: idle,
    disabled: authStatus !== 'authenticated',
  });

  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (!showModal) return;

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil(getRemainingTime() / 1000);

      setRemainingTime(formatTime(remaining));
    }, HEADING_UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showModal, getRemainingTime]);

  const stillHere = () => {
    reset();
    setShowModal(false);
    setRemainingTime(initialTime);
  };

  return (
    <Modal showModal={showModal}>
      <Modal.Header>
        {`${logoutWarningComponent.heading} ${remainingTime}.`}
      </Modal.Header>
      <Modal.Body>
        <p>{logoutWarningComponent.body}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={styles.signIn}
          onClick={stillHere}
          data-testid='modal-sign-in'
        >
          {logoutWarningComponent.signIn}
        </Button>
        <div className={styles.signOut}>
          <a
            className='nhsuk-link'
            href={signOut.href}
            data-testid='modal-sign-out'
          >
            {signOut.text}
          </a>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
