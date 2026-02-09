import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { type MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import {
  NHSNotifySummaryList,
  NHSNotifySummaryListKey,
  NHSNotifySummaryListRow,
  NHSNotifySummaryListValue,
} from '@atoms/NHSNotifySummaryList/NHSNotifySummaryList';
import content from '@content/content';
import {
  moveToProductionAction,
  ReviewAndMoveToProductionForm,
} from '@forms/ReviewAndMoveToProductionForm';
import { MessagePlanCascadePreview } from '@molecules/MessagePlanCascadePreview/MessagePlanCascadePreview';
import {
  getMessagePlanTemplates,
  getRoutingConfig,
} from '@utils/message-plans';
import { NHSNotifyFormProvider } from '@providers/form-provider';

const pageContent = content.pages.reviewAndMoveToProduction;

export const metadata: Metadata = {
  title: pageContent.pageTitle,
};

export default async function ReviewAndMoveMessagePlanPage({
  params,
}: MessagePlanPageProps) {
  const { routingConfigId } = await params;

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  if (messagePlan.status !== 'DRAFT') {
    return redirect('/message-plans', RedirectType.replace);
  }

  const templates = await getMessagePlanTemplates(messagePlan);

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-three-quarters'>
          <span className='nhsuk-caption-l'>{pageContent.headerCaption}</span>
          <h1 className='nhsuk-heading-l'>{pageContent.pageHeading}</h1>

          <NHSNotifySummaryList data-testid='message-plan-details'>
            <NHSNotifySummaryListRow>
              <NHSNotifySummaryListKey>
                {pageContent.summaryTable.rowHeadings.name}
              </NHSNotifySummaryListKey>
              <NHSNotifySummaryListValue data-testid='plan-name'>
                {messagePlan.name}
              </NHSNotifySummaryListValue>
            </NHSNotifySummaryListRow>
          </NHSNotifySummaryList>

          <MessagePlanCascadePreview
            messagePlan={messagePlan}
            templates={templates}
          />

          <NHSNotifyFormProvider serverAction={moveToProductionAction}>
            <ReviewAndMoveToProductionForm
              routingConfigId={routingConfigId}
              lockNumber={messagePlan.lockNumber}
            />
          </NHSNotifyFormProvider>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
