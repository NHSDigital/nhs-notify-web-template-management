import React, { HTMLProps } from 'react';
import classNames from 'classnames';

interface NotifyBackLinkProps extends HTMLProps<HTMLAnchorElement> {
  asElement?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

function NotifyBackLink({
  asElement: Component = 'a',
  className,
  children,
  ...rest
}: NotifyBackLinkProps) {
  return (
    <Component
      className={classNames('nhsuk-back-link', className)}
      data-testid='back-link-top'
      {...rest}
    >
      {children}
    </Component>
  );
}

export default NotifyBackLink;
