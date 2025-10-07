'use server';

import { Metadata } from 'next';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getMessagePlan } from '@utils/message-plans';

import content from '@content/content';

const { pageTitle } = content.pages.chooseTemplatesForMessagePlan;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseTemplatesPage(props: MessagePlanPageProps) {
  const { routingConfigId } = await props.params;

  const routingConfig = await getMessagePlan(routingConfigId);

  return <CreateEditMessagePlan messagePlan={routingConfig} />;
}
