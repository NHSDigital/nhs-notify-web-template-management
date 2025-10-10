import InvalidConfig from '@molecules/InvalidConfig/InvalidConfig';
import content from '@content/content';
import { Metadata } from 'next';

const pageContent = content.pages.letterTemplateInvalidConfiguration;

export const metadata: Metadata = {
  title: pageContent.title,
};

export default function ClientIdAndCampaignIdRequiredPage() {
  return <InvalidConfig {...pageContent} />;
}
