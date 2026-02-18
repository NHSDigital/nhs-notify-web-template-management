import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { type MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import {
  NHSNotifySummaryList,
  NHSNotifySummaryListKey,
  NHSNotifySummaryListRow,
  NHSNotifySummaryListValue,
} from '@atoms/NHSNotifySummaryList/NHSNotifySummaryList';
import content from '@content/content';
import { MessagePlanCascadePreview } from '@molecules/MessagePlanCascadePreview/MessagePlanCascadePreview';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getBasePath } from '@utils/get-base-path';
import { interpolate } from '@utils/interpolate';
import {
  getMessagePlanTemplates,
  getRoutingConfig,
} from '@utils/message-plans';
import { moveToProductionAction } from './server-action';
import { NHSNotifyContainer } from '@layouts/container/container';

const pageContent = content.pages.reviewAndMoveToProduction;
const basePath = getBasePath();

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
    return redirect(
      `/message-plans/preview-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const templates = await getMessagePlanTemplates(messagePlan);

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyFormProvider serverAction={moveToProductionAction}>
          <NHSNotifyForm.ErrorSummary />
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-three-quarters'>
              <span className='nhsuk-caption-l'>
                {pageContent.headerCaption}
              </span>
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

              <NHSNotifyForm.Form formId='review-and-move-to-production'>
                <input
                  type='hidden'
                  name='routingConfigId'
                  value={routingConfigId}
                  readOnly
                />
                <input
                  type='hidden'
                  name='lockNumber'
                  value={messagePlan.lockNumber}
                  readOnly
                />
                <NHSNotifyForm.FormGroup>
                  <NHSNotifyButton
                    warning
                    type='submit'
                    data-testid='move-to-production-button'
                  >
                    {pageContent.buttons.moveToProduction.text}
                  </NHSNotifyButton>
                  <NHSNotifyButton
                    secondary
                    href={interpolate(pageContent.buttons.keepInDraft.href, {
                      basePath,
                      routingConfigId,
                    })}
                    className='nhsuk-u-margin-left-3'
                    data-testid='keep-in-draft-link'
                  >
                    {pageContent.buttons.keepInDraft.text}
                  </NHSNotifyButton>
                </NHSNotifyForm.FormGroup>
              </NHSNotifyForm.Form>
            </div>
          </div>
        </NHSNotifyFormProvider>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
