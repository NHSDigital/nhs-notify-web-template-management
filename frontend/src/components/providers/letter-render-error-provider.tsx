'use client';

import type { ErrorState } from '@utils/types';
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

type LetterRenderErrorContextValue = {
  parentErrorState: ErrorState | undefined;
  setParentErrorState: (state: ErrorState | undefined) => void;
  letterRenderErrorState: ErrorState | undefined;
  setLetterRenderErrorState: (state: ErrorState | undefined) => void;
};

const LetterRenderErrorContext =
  createContext<LetterRenderErrorContextValue | null>(null);

export function useLetterRenderError() {
  const context = useContext(LetterRenderErrorContext);

  if (!context) {
    throw new Error(
      'useLetterRenderError must be used within LetterRenderErrorProvider'
    );
  }

  return context;
}

export function LetterRenderErrorProvider({ children }: PropsWithChildren) {
  const [parentErrorState, setParentErrorState] = useState<
    ErrorState | undefined
  >();
  const [letterRenderErrorState, setLetterRenderErrorState] = useState<
    ErrorState | undefined
  >();

  return (
    <LetterRenderErrorContext.Provider
      value={{
        parentErrorState,
        setParentErrorState,
        letterRenderErrorState,
        setLetterRenderErrorState,
      }}
    >
      {children}
    </LetterRenderErrorContext.Provider>
  );
}
