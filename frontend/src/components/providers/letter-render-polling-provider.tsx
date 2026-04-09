'use client';

import { RenderKey } from '@utils/types';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

type LetterRenderPollingContextValue = {
  isAnyTabPolling: boolean;
  registerPolling: (key: RenderKey, polling: boolean) => void;
};

const LetterRenderPollingContext =
  createContext<LetterRenderPollingContextValue | null>(null);

export function useLetterRenderPolling() {
  const context = useContext(LetterRenderPollingContext);

  if (!context) {
    throw new Error(
      'useLetterRenderPolling must be used within LetterRenderPollingProvider'
    );
  }

  return context;
}

export function LetterRenderPollingProvider({ children }: PropsWithChildren) {
  const [isAnyTabPolling, setIsAnyTabPolling] = useState(false);

  const pollingMapRef = useRef<Partial<Record<RenderKey, boolean>>>({});

  const registerPolling = useCallback((key: RenderKey, polling: boolean) => {
    pollingMapRef.current[key] = polling;

    setIsAnyTabPolling(Object.values(pollingMapRef.current).some(Boolean));
  }, []);

  return (
    <LetterRenderPollingContext.Provider
      value={{
        isAnyTabPolling,
        registerPolling,
      }}
    >
      {children}
    </LetterRenderPollingContext.Provider>
  );
}
