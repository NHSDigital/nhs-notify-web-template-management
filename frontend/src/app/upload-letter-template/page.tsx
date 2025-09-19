import { Metadata } from 'next';
import { UploadLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import { getSessionServer } from '@utils/amplify-utils';
import { redirect, RedirectType } from 'next/navigation';
import { fetchClient } from '@utils/server-features';
import content from '@content/content';
import { ClientConfiguration } from 'nhs-notify-backend-client';

const { pageTitle } = content.components.templateFormLetter;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const getSortedCampaignIds = (
  clientConfiguration: ClientConfiguration | null | undefined
) => {
  if (!clientConfiguration) {
    return;
  }

  const { campaignIds, campaignId } = clientConfiguration;

  if (campaignIds) {
    return campaignIds.sort();
  }

  if (campaignId) {
    return [campaignId];
  }
};

const UploadLetterTemplatePage = async () => {
  const sessionServer = await getSessionServer();
  const { accessToken, clientId } = sessionServer;

  if (!accessToken || !clientId) {
    return redirect(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  }

  const clientConfigurationResult = await fetchClient(accessToken);

  const clientConfiguration = clientConfigurationResult?.data;

  const campaignIds = getSortedCampaignIds(clientConfiguration);

  if (!campaignIds || campaignIds.length === 0) {
    return redirect(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  }

  const initialState: UploadLetterTemplate = {
    templateType: 'LETTER',
    name: '',
    letterType: 'x0',
    language: 'en',
    campaignId: campaignIds.length === 1 ? campaignIds[0] : '',
  };

  return (
    <LetterTemplateForm initialState={initialState} campaignIds={campaignIds} />
  );
};

export default UploadLetterTemplatePage;
