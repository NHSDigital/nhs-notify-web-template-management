'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import Link from 'next/link';
import { interpolate } from '@utils/interpolate';
import type { RoutingConfigReference } from 'nhs-notify-web-template-management-types';

import copyText from '@content/content';
const content = copyText.pages.deleteTemplateErrorPage;

type DeleteTemplateErrorProps = {
  templateName: string;
  messagePlans: RoutingConfigReference[];
};

export default function DeleteTemplateError({
  templateName,
  messagePlans,
}: DeleteTemplateErrorProps) {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-l' data-testid='page-heading'>
            {interpolate(content.pageHeading, {
              templateName,
            })}
          </h1>
          <p>{content.intro}</p>
          <ul
            className='nhsuk-list nhsuk-list--bullet'
            data-testid='message-plan-list'
          >
            {messagePlans.map((plan) => (
              <li key={plan.id}>{plan.name}</li>
            ))}
          </ul>
          <p>{content.guidance}</p>
          <p>
            <Link href={content.backLinkUrl} data-testid='back-link-bottom'>
              {content.backLinkText}
            </Link>
          </p>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
