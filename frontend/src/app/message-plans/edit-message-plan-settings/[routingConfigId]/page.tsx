import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import type { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyErrorSummary } from '@atoms/NHSNotifyForm/ErrorSummary';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { getCampaignIds } from '@utils/client-config';
import { getRoutingConfig } from '@utils/message-plans';
import { fetchClient } from '@utils/server-features';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { editMessagePlanSettingsServerAction } from './server-action';

const pageContent = content.pages.editMessagePlanSettings;

export const metadata: Metadata = {
  title: pageContent.pageTitle,
};

export default async function EditMessagePlanSettingsPage({
  params,
}: MessagePlanPageProps) {
  const { routingConfigId } = await params;

  const [routingConfig, clientConfig] = await Promise.all([
    getRoutingConfig(routingConfigId),
    fetchClient(),
  ]);

  if (!routingConfig) {
    redirect('/message-plans/invalid', RedirectType.replace);
  }

  const campaignIds = getCampaignIds(clientConfig);

  if (campaignIds.length === 0) {
    redirect('/message-plans/campaign-id-required', RedirectType.replace);
  }

  return (
    <NHSNotifyMain>
      <NHSNotifyFormProvider serverAction={editMessagePlanSettingsServerAction}>
        <NHSNotifyErrorSummary />
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <h1 className='nhsuk-heading-xl'>{pageContent.pageHeading}</h1>
            <MessagePlanForm
              backLink={pageContent.backLink(routingConfigId)}
              campaignIds={campaignIds}
              initialState={routingConfig}
            >
              <input
                type='hidden'
                name='routingConfigId'
                value={routingConfigId}
                readOnly
              />
              <input
                type='hidden'
                name='lockNumber'
                value={routingConfig.lockNumber}
                readOnly
              />
            </MessagePlanForm>
          </div>
        </div>
      </NHSNotifyFormProvider>
    </NHSNotifyMain>
  );
}
