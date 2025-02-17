'use client';

import { Button } from 'nhsuk-react-components';

export function NHSNotifyButton({
  children,
  href,
  ...rest
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      preventDoubleClick
      debounceTimeout={10_000}
      onClick={() => {}}
      href={href}
      {...rest}
    >
      {children}
    </Button>
  );
}
