'use client';

import { useEffect, useRef, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { Button } from 'nhsuk-react-components';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter, usePathname } from 'next/navigation';
import { Modal } from '@molecules/Modal/Modal';
import content from '@content/content';
import { getBasePath } from '@utils/get-base-path';
import { formatTime } from './format-time';

import styles from './LogoutWarningModal.module.scss';

export const LogoutWarningModal = ({
  promptBeforeLogoutSeconds: promptTimeSeconds,
  logoutInSeconds,
}: {
  promptBeforeLogoutSeconds: number;
  logoutInSeconds: number;
}) => {
  const {
    headerComponent: {
      links: { logOut },
    },
    logoutWarningComponent,
  } = content.components;

  const router = useRouter();
  const pathname = usePathname();
  const initial = formatTime(promptTimeSeconds);
  const [showModal, setShowModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(initial);
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const idle = () => {
    setShowModal(false);

    router.push(
      `/auth/inactive?redirect=${encodeURIComponent(
        `${getBasePath()}/${pathname}`
      )}`
    );
  };

  const prompted = () => {
    setShowModal(true);
  };

  const { reset, getRemainingTime } = useIdleTimer({
    timeout: logoutInSeconds * 1000,
    promptBeforeIdle: promptTimeSeconds * 1000,
    onPrompt: prompted,
    onIdle: idle,
    disabled: authStatus !== 'authenticated',
  });

  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!showModal) return;

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil(getRemainingTime() / 1000);

      setRemainingTime(formatTime(remaining));
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [showModal, getRemainingTime]);

  const stillHere = () => {
    reset();
    setShowModal(false);
    setRemainingTime(initial);
    fetchAuthSession({ forceRefresh: true });
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
            href={logOut.href}
            data-testid='modal-sign-out'
          >
            {logOut.text}
          </a>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
