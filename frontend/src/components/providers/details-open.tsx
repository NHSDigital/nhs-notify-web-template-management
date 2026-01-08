'use client';

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from 'nhsuk-react-components';

const DetailsOpenContext = createContext<[boolean, () => void]>([
  false,
  () => {},
]);

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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const details = ref.current.querySelectorAll<HTMLDetailsElement>(
      `details.${targetClassName}`
    );

    for (const element of details) {
      element.open = isOpen;
    }
  }, [isOpen, targetClassName]);

  const toggle = useMemo(
    () => () => {
      setIsOpen(!isOpen);
    },
    [isOpen]
  );

  return (
    <DetailsOpenContext.Provider value={[isOpen, toggle]}>
      <div ref={ref}>{children}</div>
    </DetailsOpenContext.Provider>
  );
}

export function DetailsOpenButton() {
  const [isOpen, toggle] = useDetailsOpen();

  return (
    <Button type='button' secondary onClick={toggle}>
      {isOpen ? 'Close all template previews' : 'Open all template previews'}
    </Button>
  );
}
