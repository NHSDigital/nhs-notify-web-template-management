'use client';

import type { ErrorState } from 'nhs-notify-web-template-management-utils';
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

type LetterPreviewErrorContextValue = {
  approveErrorState: ErrorState | undefined;
  setApproveErrorState: (state: ErrorState | undefined) => void;
  updatePreviewErrorState: ErrorState | undefined;
  setUpdatePreviewErrorState: (state: ErrorState | undefined) => void;
};

const LetterPreviewErrorContext =
  createContext<LetterPreviewErrorContextValue | null>(null);

export function useLetterPreviewError() {
  const context = useContext(LetterPreviewErrorContext);

  if (!context) {
    throw new Error(
      'useLetterPreviewError must be used within LetterPreviewErrorProvider'
    );
  }

  return context;
}

export function LetterPreviewErrorProvider({ children }: PropsWithChildren) {
  const [approveErrorState, setApproveErrorState] = useState<
    ErrorState | undefined
  >();
  const [updatePreviewErrorState, setUpdatePreviewErrorState] = useState<
    ErrorState | undefined
  >();

  return (
    <LetterPreviewErrorContext.Provider
      value={{
        approveErrorState,
        setApproveErrorState,
        updatePreviewErrorState,
        setUpdatePreviewErrorState,
      }}
    >
      {children}
    </LetterPreviewErrorContext.Provider>
  );
}
