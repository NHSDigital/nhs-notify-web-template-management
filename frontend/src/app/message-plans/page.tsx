'use server';

import content from '@content/content';
import { MessagePlans } from '@molecules/MessagePlans/MessagePlans';
import { Metadata } from 'next';
import { getRoutingConfigs } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { serverIsFeatureEnabled } from '@utils/server-features';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: content.pages.messagePlansPage.pageTitle,
  };
}

const MessagePlansPage = async () => {
  const routing = await serverIsFeatureEnabled('routing');

  if (!routing) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const plans = await getRoutingConfigs();

  const draft = plans.filter((r) => r.status === 'DRAFT');

  const production = plans.filter((r) => r.status === 'PRODUCTION');

  return (
    <MessagePlans
      draft={{
        plans: draft,
        count: draft.length,
      }}
      production={{
        plans: production,
        count: production.length,
      }}
    />
  );
};

export default MessagePlansPage;
