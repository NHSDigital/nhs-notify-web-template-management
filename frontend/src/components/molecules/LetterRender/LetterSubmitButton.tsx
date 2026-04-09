'use client';

import type { PropsWithChildren } from 'react';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';
import { useLetterPreviewError } from '@providers/letter-preview-error-provider';

export function LetterSubmitButton({ children }: PropsWithChildren) {
  const { isAnyTabPolling } = useLetterRenderPolling();
  const { setUpdatePreviewErrorState } = useLetterPreviewError();

  return (
    <NHSNotifyButton
      type='submit'
      data-testid='preview-letter-template-cta'
      id='preview-letter-template-cta'
      disabled={isAnyTabPolling}
      onClick={() => setUpdatePreviewErrorState(undefined)}
    >
      {children}
    </NHSNotifyButton>
  );
}
