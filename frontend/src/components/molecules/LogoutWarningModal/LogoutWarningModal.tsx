'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'nhsuk-react-components';
import { Modal } from '@molecules/Modal/Modal';
import { useRouter, usePathname } from 'next/navigation';
import { useIdleTimer } from 'react-idle-timer';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@content/content';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getBasePath } from '@utils/get-base-path';
import styles from './LogoutWarningModal.module.scss';
import { formatTime } from './format-time';

export const LogoutWarningModal = ({
  promptTimeSeconds,
  logoutInSeconds,
}: {
  promptTimeSeconds: number;
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

  const authenticated = authStatus === 'authenticated';

  const idle = () => {
    if (!authenticated) return;

    setShowModal(false);

    router.push(
      `/auth/inactive?redirect=${encodeURIComponent(
        `${getBasePath()}/${pathname}`
      )}`
    );
  };

  const prompted = () => {
    if (authenticated) {
      setShowModal(true);
    }
  };

  const { reset, getRemainingTime } = useIdleTimer({
    timeout: logoutInSeconds * 1000,
    promptBeforeIdle: promptTimeSeconds * 1000,
    onPrompt: prompted,
    onIdle: idle,
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
  });

  const stillHere = () => {
    reset();
    setShowModal(false);
    fetchAuthSession({ forceRefresh: true });
  };

  return (
    <Modal showModal={showModal}>
      <Modal.Header>
        {logoutWarningComponent.heading(remainingTime)}
      </Modal.Header>
      <Modal.Body>
        <p>{logoutWarningComponent.body}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button className={styles.signIn} onClick={stillHere}>
          {logoutWarningComponent.signIn}
        </Button>
        <div className={styles.signOut}>
          <a className='nhsuk-link' href={logOut.href}>
            {logOut.text}
          </a>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
