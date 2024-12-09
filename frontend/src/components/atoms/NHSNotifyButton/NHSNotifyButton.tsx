'use client';

import { Button } from 'nhsuk-react-components';
import { ButtonType } from './button.types';

export function NHSNotifyButton({
  children,
  href,
  ...rest
}: ButtonType & React.ComponentProps<typeof Button>) {
  return (
    <Button {...rest} href={href} data-testid='link-button'>
      {children}
    </Button>
  );
}
