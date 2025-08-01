import InvalidConfig from '@molecules/InvalidConfig/InvalidConfig';
import content from '@content/content';
import { Metadata } from 'next';

const { pageTitle } = content.pages.invalidConfiguration;

export const metadata: Metadata = {
  title: pageTitle,
};

export default function ClientIdAndCampaignIdRequiredPage() {
  return <InvalidConfig />;
}
