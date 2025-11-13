'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';

import content from '@content/content';
import { ChooseChannelTemplate } from '@forms/ChooseChannelTemplate';
import { getTemplates } from '@utils/form-actions';
const { pageTitle, pageHeading } = content.pages.chooseTextMessageTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseTextMessageTemplate(
  props: MessagePlanPageProps
) {
  const { routingConfigId } = await props.params;

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const cascadeIndex = messagePlan.cascade.findIndex(
    (item) => item.channel === 'SMS'
  );

  if (cascadeIndex === -1) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const availableTemplateList = await getTemplates({
    templateType: 'SMS',
    templateStatus: 'SUBMITTED',
  });

  return (
    <ChooseChannelTemplate
      messagePlan={messagePlan}
      pageHeading={pageHeading}
      templateList={availableTemplateList}
      cascadeIndex={cascadeIndex}
    />
  );
}
