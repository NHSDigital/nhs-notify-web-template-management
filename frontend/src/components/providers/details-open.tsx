'use client';

import {
  ComponentProps,
  createContext,
  HTMLProps,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from 'nhsuk-react-components';

const DetailsOpenContext = createContext<[boolean, () => void] | null>(null);

export function useDetailsOpen() {
  const context = useContext(DetailsOpenContext);

  if (!context) {
    throw new Error('useDetailsOpen must be used within DetailsOpenProvider');
  }

  return context;
}

export function updateDetailsOpenState(
  root: HTMLDivElement | null,
  targetClassName: string,
  isOpen: boolean
) {
  if (!root) return;

  const details = root.querySelectorAll<HTMLDetailsElement>(
    `details.${targetClassName}`
  );
  for (const element of details) {
    element.open = isOpen;
  }
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
    updateDetailsOpenState(ref.current, targetClassName, isOpen);
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

type ButtonProps = Exclude<
  ComponentProps<typeof Button>,
  HTMLProps<HTMLAnchorElement>
>;

type DetailsOpenButtonProps = Omit<ButtonProps, 'as' | 'onClick' | 'type'> & {
  render: (isOpen: boolean) => ReactNode;
};

export function DetailsOpenButton({
  render,
  ...props
}: DetailsOpenButtonProps) {
  const [isOpen, toggle] = useDetailsOpen();

  return (
    <Button {...props} type='button' onClick={toggle}>
      {render(isOpen)}
    </Button>
  );
}
