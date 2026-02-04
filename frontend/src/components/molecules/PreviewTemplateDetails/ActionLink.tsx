'use client';

import { SummaryList } from 'nhsuk-react-components';
import Link from 'next/link';

export type ActionLinkProps = {
  href: string;
  label: string;
  visuallyHiddenText: string;
  hidden?: boolean;
  testId?: string;
  external?: boolean;
};

export function ActionLink({
  href,
  label,
  visuallyHiddenText,
  hidden,
  testId,
  external,
}: ActionLinkProps) {
  if (hidden) {
    return <SummaryList.Actions aria-hidden='true' />;
  }

  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <SummaryList.Actions className='nhsuk-u-padding-right-4'>
      <Link href={href} data-testid={testId} {...externalProps}>
        {label}
        <span className='nhsuk-u-visually-hidden'> {visuallyHiddenText}</span>
      </Link>
    </SummaryList.Actions>
  );
}
