'use client';

import type { PropsWithChildren } from 'react';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';

export function LetterSubmitButton({ children }: PropsWithChildren) {
  const { isAnyTabPolling, setTabErrorState } = useLetterRenderPolling();

  return (
    <NHSNotifyButton
      type='submit'
      data-testid='preview-letter-template-cta'
      id='preview-letter-template-cta'
      disabled={isAnyTabPolling}
      onClick={() => setTabErrorState(undefined)}
    >
      {children}
    </NHSNotifyButton>
  );
}
