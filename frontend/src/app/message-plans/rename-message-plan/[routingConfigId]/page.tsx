import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import type { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyFormErrorSummary } from '@atoms/NHSNotifyForm/ErrorSummary';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { getRoutingConfig } from '@utils/message-plans';
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

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig) {
    redirect('/message-plans/invalid', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyFormProvider
          serverAction={editMessagePlanSettingsServerAction}
        >
          <NHSNotifyFormErrorSummary />
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-two-thirds'>
              <h1 className='nhsuk-heading-xl'>{pageContent.pageHeading}</h1>
              <MessagePlanForm
                backLink={pageContent.backLink(routingConfigId)}
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
    </NHSNotifyContainer>
  );
}
