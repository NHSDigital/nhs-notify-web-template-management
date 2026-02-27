import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import {
  messagePlanStatusToDisplayText,
  messagePlanStatusToTagColour,
  type MessagePlanPageProps,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyWarningCallout } from '@atoms/NHSNotifyWarningCallout/NHSNotifyWarningCallout';
import { Tag } from '@atoms/nhsuk-components';
import {
  NHSNotifySummaryList,
  NHSNotifySummaryListKey,
  NHSNotifySummaryListRow,
  NHSNotifySummaryListValue,
} from '@atoms/NHSNotifySummaryList/NHSNotifySummaryList';
import content from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { MessagePlanCascadePreview } from '@molecules/MessagePlanCascadePreview/MessagePlanCascadePreview';
import {
  getMessagePlanTemplates,
  getRoutingConfig,
} from '@utils/message-plans';

const pageContent = content.pages.previewMessagePlan;

export const metadata: Metadata = {
  title: pageContent.pageTitle,
};

export default async function PreviewMessagePlanPage({
  params,
}: MessagePlanPageProps) {
  const { routingConfigId } = await params;

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  if (messagePlan.status === 'DRAFT') {
    return redirect(
      `/message-plans/edit-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const templates = await getMessagePlanTemplates(messagePlan);

  return (
    <NHSNotifyContainer>
      <Link
        href={pageContent.backLink.href}
        className='nhsuk-back-link'
        data-testid='back-link-top'
      >
        {pageContent.backLink.text}
      </Link>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-three-quarters'>
            <span className='nhsuk-caption-l'>{pageContent.headerCaption}</span>
            <h1 className='nhsuk-heading-l'>{messagePlan.name}</h1>
            <NHSNotifyWarningCallout data-testid='warning-callout'>
              <ContentRenderer
                content={pageContent.warningCallout}
                variables={{ routingConfigId }}
              />
            </NHSNotifyWarningCallout>

            <NHSNotifySummaryList data-testid='message-plan-details'>
              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>
                  {pageContent.summaryTable.rowHeadings.id}
                </NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue
                  className='monospace-font'
                  data-testid='plan-id'
                >
                  {routingConfigId}
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>

              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>
                  {pageContent.summaryTable.rowHeadings.campaignId}
                </NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue
                  className='monospace-font'
                  data-testid='campaign-id'
                >
                  {messagePlan.campaignId}
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>

              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>
                  {pageContent.summaryTable.rowHeadings.status}
                </NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue data-testid='status'>
                  <Tag color={messagePlanStatusToTagColour(messagePlan.status)}>
                    {messagePlanStatusToDisplayText(messagePlan.status)}
                  </Tag>
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>
            </NHSNotifySummaryList>

            <MessagePlanCascadePreview
              messagePlan={messagePlan}
              templates={templates}
            />

            <div className='nhsuk-form-group'>
              <p>
                <Link
                  href={pageContent.backLink.href}
                  data-testid='back-link-bottom'
                >
                  {pageContent.backLink.text}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
