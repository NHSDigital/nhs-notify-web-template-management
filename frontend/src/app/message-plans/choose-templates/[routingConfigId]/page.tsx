'use server';

import { Metadata } from 'next';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getMessagePlan, getMessagePlanTemplates } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';

import content from '@content/content';
const { pageTitle } = content.pages.chooseTemplatesForMessagePlan;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseTemplatesPage(props: MessagePlanPageProps) {
  const { routingConfigId } = await props.params;

  const messagePlan = await getMessagePlan(routingConfigId);

  if (!messagePlan) {
    // TODO: Error handling here
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const templates = await getMessagePlanTemplates(messagePlan);

  return (
    <CreateEditMessagePlan messagePlan={messagePlan} templates={templates} />
  );
}
