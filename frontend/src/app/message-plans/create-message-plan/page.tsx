import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod/v4';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { MESSAGE_ORDER_OPTIONS_LIST } from 'nhs-notify-web-template-management-utils';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Create message plan - NHS Notify',
  };
}

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
  let params: CreateMessagePlanPageSearchParams;

  try {
    params = $CreateMessagePlanPageSearchParams.parse(await searchParams);
  } catch {
    redirect('/message-plans/choose-message-order', RedirectType.replace);
  }

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            Create a message plan
          </h1>
          <MessagePlanForm messageOrder={params.messageOrder} />
        </div>
      </div>
    </NHSNotifyMain>
  );
}
