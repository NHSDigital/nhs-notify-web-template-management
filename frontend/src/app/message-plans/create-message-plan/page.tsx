import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod/v4';
import { MESSAGE_ORDER_OPTIONS_LIST } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import {
  MessagePlanForm,
  NHSNotifyFormProvider,
} from '@forms/MessagePlan/MessagePlan';
import { getCampaignIds } from '@utils/client-config';
import { fetchClient } from '@utils/server-features';
import { createMessagePlanServerAction } from './server-action';

const pageContent = content.pages.createMessagePlan;

export const metadata: Metadata = {
  title: pageContent.pageTitle,
};

const $CreateMessagePlanPageSearchParams = z.object({
  messageOrder: z.enum(MESSAGE_ORDER_OPTIONS_LIST),
});

type CreateMessagePlanPageSearchParams = z.infer<
  typeof $CreateMessagePlanPageSearchParams
>;

export default async function CreateMessagePlanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const clientConfig = await fetchClient();

  const campaignIds = getCampaignIds(clientConfig);

  if (campaignIds.length === 0) {
    redirect('/message-plans/campaign-id-required', RedirectType.replace);
  }

  let params: CreateMessagePlanPageSearchParams;

  try {
    params = $CreateMessagePlanPageSearchParams.parse(await searchParams);
  } catch {
    redirect('/message-plans/choose-message-order', RedirectType.replace);
  }

  return (
    <NHSNotifyMain>
      <NHSNotifyFormProvider serverAction={createMessagePlanServerAction}>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <h1 className='nhsuk-heading-xl'>{pageContent.pageHeading}</h1>
            <MessagePlanForm
              backLink={pageContent.backLink}
              campaignIds={campaignIds}
            >
              <input
                type='hidden'
                name='messageOrder'
                value={params.messageOrder}
                readOnly
              />
            </MessagePlanForm>
          </div>
        </div>
      </NHSNotifyFormProvider>
    </NHSNotifyMain>
  );
}
