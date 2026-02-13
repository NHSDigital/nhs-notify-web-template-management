'use client';

import { useLayoutEffect } from 'react';

export default function JsCheck() {
  useLayoutEffect(() => {
    const body = document.body;

    body.classList.add('js-enabled');

    if ('noModule' in HTMLScriptElement.prototype) {
      body.classList.add('nhsuk-frontend-supported');
    }
  }, []);

  return null;
}
