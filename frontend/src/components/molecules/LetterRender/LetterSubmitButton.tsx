'use client';

import type { PropsWithChildren } from 'react';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';
import { useLetterRenderError } from '@providers/letter-render-error-provider';

export function LetterSubmitButton({ children }: PropsWithChildren) {
  const { isAnyTabPolling } = useLetterRenderPolling();
  const { setLetterRenderErrorState } = useLetterRenderError();

  return (
    <NHSNotifyButton
      type='submit'
      data-testid='preview-letter-template-cta'
      id='preview-letter-template-cta'
      disabled={isAnyTabPolling}
      onClick={() => setLetterRenderErrorState(undefined)}
    >
      {children}
    </NHSNotifyButton>
  );
}
