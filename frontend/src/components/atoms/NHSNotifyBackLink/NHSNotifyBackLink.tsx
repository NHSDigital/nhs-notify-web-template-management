import React, { HTMLProps, ElementType, ReactNode } from 'react';
import classNames from 'classnames';

interface NotifyBackLinkProps<T extends HTMLElement = HTMLAnchorElement>
  extends HTMLProps<T> {
  asElement?: ElementType;
  className?: string;
  children: ReactNode;
}

export function NotifyBackLink<T extends HTMLElement = HTMLAnchorElement>({
  asElement: Component = 'a',
  className,
  children,
  ...rest
}: NotifyBackLinkProps<T>) {
  return (
    <Component className={classNames('nhsuk-back-link', className)} {...rest}>
      {children}
    </Component>
  );
}

export default NotifyBackLink;
