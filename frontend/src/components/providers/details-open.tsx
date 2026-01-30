'use client';

import {
  ComponentProps,
  createContext,
  HTMLProps,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Button, Details } from 'nhsuk-react-components';

const DetailsOpenContext = createContext<[boolean, () => void] | null>(null);

function useDetailsOpen() {
  const context = useContext(DetailsOpenContext);

  if (!context) {
    throw new Error('useDetailsOpen must be used within DetailsOpenProvider');
  }

  return context;
}

export function DetailsOpenProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useMemo(
    () => () => {
      setIsOpen(!isOpen);
    },
    [isOpen]
  );

  return (
    <DetailsOpenContext.Provider value={[isOpen, toggle]}>
      {children}
    </DetailsOpenContext.Provider>
  );
}

type ButtonProps = Exclude<
  ComponentProps<typeof Button>,
  HTMLProps<HTMLAnchorElement>
>;

type DetailsOpenButtonProps = Omit<ButtonProps, 'as' | 'onClick' | 'type'> & {
  openText: string;
  closedText: string;
};

export function DetailsOpenButton({
  openText,
  closedText,
  ...props
}: DetailsOpenButtonProps) {
  const [isOpen, toggle] = useDetailsOpen();

  return (
    <Button {...props} type='button' onClick={toggle}>
      {isOpen ? openText : closedText}
    </Button>
  );
}

export function ControlledDetails({
  children,
  ...props
}: Omit<HTMLProps<HTMLDetailsElement>, 'open'>) {
  const [isOpen] = useDetailsOpen();

  return (
    <Details {...props} open={isOpen}>
      {children}
    </Details>
  );
}
