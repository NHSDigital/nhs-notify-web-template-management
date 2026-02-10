import InvalidConfig from '@molecules/InvalidConfig/InvalidConfig';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { Metadata } from 'next';

const pageContent = content.pages.letterTemplateInvalidConfiguration;

export const metadata: Metadata = {
  title: pageContent.title,
};

export default function ClientIdAndCampaignIdRequiredPage() {
  return (
    <NHSNotifyContainer>
      <InvalidConfig {...pageContent} />
    </NHSNotifyContainer>
  );
}
