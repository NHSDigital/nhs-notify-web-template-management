import type { Metadata } from 'next';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import InvalidConfig from '@molecules/InvalidConfig/InvalidConfig';

const pageContent = content.pages.messagePlanInvalidConfiguration;

export const metadata: Metadata = {
  title: pageContent.title,
};

export default function MessagePlanCampaignIdRequiredPage() {
  return (
    <NHSNotifyContainer>
      <InvalidConfig {...pageContent} />
    </NHSNotifyContainer>
  );
}
