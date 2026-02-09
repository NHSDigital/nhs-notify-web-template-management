import React, { HTMLProps } from 'react';
import classNames from 'classnames';
import Link from 'next/link';

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

type LinkProps = React.ComponentProps<typeof Link>;

export function NHSNotifyBackLink({
  children,
  className,
  ...props
}: LinkProps) {
  return (
    <Link
      className={classNames('nhsuk-back-link', className)}
      data-testid='back-link-top'
      {...props}
    >
      {children}
    </Link>
  );
}

export default NotifyBackLink;
