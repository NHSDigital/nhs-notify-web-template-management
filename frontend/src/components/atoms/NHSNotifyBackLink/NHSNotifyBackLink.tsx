import React, { PropsWithChildren, ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames';

export function NotifyBackLink<T extends 'a' | 'button' = 'a'>({
  children,
  className,
  asElement: Component = 'a',
  ...rest
}: PropsWithChildren<{
  asElement?: T;
  className?: string;
}> & ComponentPropsWithoutRef<T>) {
  return (
    <Component className={classNames('nhsuk-back-link', className)} {...rest}>
      {children}
    </Component>
  );
}

export default NotifyBackLink;
