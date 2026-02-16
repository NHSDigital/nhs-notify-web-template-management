'use server';

import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { MessagePlans } from '@molecules/MessagePlans/MessagePlans';
import { Metadata } from 'next';
import { countRoutingConfigs, getRoutingConfigs } from '@utils/message-plans';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: content.pages.messagePlansPage.pageTitle,
  };
}

const MessagePlansPage = async () => {
  const [routingConfigurations, draftCount, completedCount] = await Promise.all(
    [
      getRoutingConfigs(),
      countRoutingConfigs('DRAFT'),
      countRoutingConfigs('COMPLETED'),
    ]
  );

  const messagePlans = routingConfigurations.map((plan) => ({
    name: plan.name,
    id: plan.id,
    lastUpdated: plan.updatedAt,
    status: plan.status,
  }));

  const draft = messagePlans.filter((r) => r.status === 'DRAFT');

  const completed = messagePlans.filter((r) => r.status === 'COMPLETED');

  return (
    <NHSNotifyContainer>
      <MessagePlans
        draft={{
          plans: draft,
          count: draftCount,
        }}
        production={{
          plans: completed,
          count: completedCount,
        }}
      />
    </NHSNotifyContainer>
  );
};

export default MessagePlansPage;
