import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import type { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyFormErrorSummary } from '@atoms/NHSNotifyForm/ErrorSummary';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { MessagePlanForm } from '@forms/MessagePlanForm/MessagePlanForm';
import { getRoutingConfig } from '@utils/message-plans';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { renameMessagePlanServerAction } from './server-action';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';

const pageContent = content.pages.renameMessagePlan;

export const metadata: Metadata = {
  title: pageContent.pageTitle,
};

export default async function RenameMessagePlanPage(
  props: MessagePlanPageProps
) {
  const { routingConfigId } = await props.params;

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/edit-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig) {
    redirect('/message-plans/invalid', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyFormProvider serverAction={renameMessagePlanServerAction}>
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
                  value={lockNumberResult.data}
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
