import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import copy from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { fetchClient } from '@utils/server-features';
import { getCampaignIds } from '@utils/client-config';
import { Upload } from '../../components/client-upload';

const content = copy.pages.uploadDocxLetterTemplatePage('x0');

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default async function UploadStandardLetterTemplatePage() {
  const client = await fetchClient();

  if (!client?.features.letterAuthoring) {
    return redirect('/choose-a-template-type', RedirectType.replace);
  }

  const campaignIds = getCampaignIds(client);

  if (campaignIds.length === 0) {
    return redirect(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyBackLink href={content.backLink.href}>
        {content.backLink.text}
      </NHSNotifyBackLink>
      <NHSNotifyMain>
        <Upload />
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
