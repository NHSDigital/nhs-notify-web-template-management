'use client';

import { SkipLink } from 'nhsuk-react-components';
import { useCallback } from 'react';

export function NHSNotifySkipLink() {
  const onClick = useCallback(() => {
    let element = document.querySelector('h1') as HTMLElement;

    if (!element) {
      element = document.querySelector('#maincontent') as HTMLElement;
    }

    if (!element) {
      return;
    }

    element.addEventListener(
      'blur',
      () => {
        element.removeAttribute('tabIndex');
      },
      { once: true }
    );

    if (!element.hasAttribute('tabIndex')) {
      element.setAttribute('tabIndex', '-1');
    }

    if (document.activeElement !== element) {
      element.focus();
    }
  }, []);

  return <SkipLink onClick={onClick} />;
}
