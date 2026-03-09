'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';

import content from '@content/content';
import { ChooseChannelTemplate } from '@forms/ChooseChannelTemplate';
import { NHSNotifyContainer } from '@layouts/container/container';
import { getTemplates } from '@utils/form-actions';
import { $LockNumber } from 'nhs-notify-backend-client';
const { pageTitle, pageHeading, noTemplatesText } =
  content.pages.chooseEmailTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseEmailTemplate(props: MessagePlanPageProps) {
  const { routingConfigId } = await props.params;

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/edit-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const cascadeIndex = messagePlan.cascade.findIndex(
    (item) => item.channel === 'EMAIL'
  );

  if (cascadeIndex === -1) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const availableTemplateList = await getTemplates({
    templateType: 'EMAIL',
  });

  return (
    <NHSNotifyContainer>
      <ChooseChannelTemplate
        messagePlan={messagePlan}
        pageHeading={pageHeading}
        noTemplatesText={noTemplatesText}
        templateList={availableTemplateList}
        cascadeIndex={cascadeIndex}
        lockNumber={lockNumberResult.data}
      />
    </NHSNotifyContainer>
  );
}
