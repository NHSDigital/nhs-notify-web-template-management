import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import type { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { getRoutingConfig } from '@utils/message-plans';

const pageContent = content.pages.messagePlanGetReadyToMoveToProduction();

export const metadata: Metadata = {
  title: pageContent.title,
};

export default async function MessagePlanGetReadyToMoveToProductionPage({
  params,
}: MessagePlanPageProps) {
  const { routingConfigId } = await params;

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <span className='nhsuk-caption-xl'>{pageContent.stepCounter}</span>
          <h1 className='nhsuk-heading-xl'>{pageContent.heading}</h1>

          <dl className='nhsuk-summary-list'>
            <div className='nhsuk-summary-list__row'>
              <dt className='nhsuk-summary-list__key'>Name</dt>
              <dd className='nhsuk-summary-list__value'>
                {routingConfig.name}
              </dd>
            </div>
          </dl>

          <ContentRenderer content={pageContent.content} />

          <div className='nhsuk-warning-callout'>
            <h3 className='nhsuk-warning-callout__label'>
              {pageContent.callout.label}
              <span className='nhsuk-u-visually-hidden'>:</span>
            </h3>
            <ContentRenderer content={pageContent.callout.content} />
          </div>
          <div className='nhsuk-form-group'>
            <NHSNotifyButton
              href={pageContent.continue.href(routingConfigId)}
              data-testid='continue-link'
            >
              {pageContent.continue.text}
            </NHSNotifyButton>

            <NHSNotifyButton
              secondary
              href={pageContent.cancel.href}
              className='nhsuk-u-margin-left-3'
              data-testid='cancel-link'
            >
              {pageContent.cancel.text}
            </NHSNotifyButton>
          </div>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
