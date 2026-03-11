'use client';

import type { PropsWithChildren } from 'react';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';

export function LetterSubmitButton({ children }: PropsWithChildren) {
  const { isAnyTabPolling } = useLetterRenderPolling();

  return (
    <button
      type='submit'
      className={`nhsuk-button${isAnyTabPolling ? ' nhsuk-button--disabled' : ''}`}
      data-testid='preview-letter-template-cta'
      id='preview-letter-template-cta'
      disabled={isAnyTabPolling}
      aria-disabled={isAnyTabPolling || undefined}
    >
      {children}
    </button>
  );
}
