'use client';

import { Button } from 'nhsuk-react-components';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
} from 'react';

const DetailsOpenContext = createContext<(() => void) | null>(null);

export function useDetailsOpen() {
  const ctx = useContext(DetailsOpenContext);

  return ctx;
}

export function DetailsOpenProvider({
  children,
  targetClassName,
}: PropsWithChildren<{
  targetClassName: string;
}>) {
  const ref = useRef<HTMLDivElement | null>(null);

  function openAll() {
    if (!ref.current) return;
    ref.current
      .querySelectorAll<HTMLDetailsElement>(`details.${targetClassName}`)
      .forEach((d) => {
        d.open = true;
      });
  }

  const value = useMemo(() => openAll, []);

  return (
    <DetailsOpenContext.Provider value={value}>
      <div ref={ref}>{children}</div>
    </DetailsOpenContext.Provider>
  );
}

export function DetailsOpenButton({ children }: PropsWithChildren) {
  const openAll = useDetailsOpen();

  return (
    <Button type='button' secondary onClick={openAll}>
      {children}
    </Button>
  );
}
