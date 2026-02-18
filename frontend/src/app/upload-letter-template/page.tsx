import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { UploadLetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import { NHSNotifyContainer } from '@layouts/container/container';
import { fetchClient } from '@utils/server-features';
import { getCampaignIds } from '@utils/client-config';

const { pageTitle } = content.components.templateFormLetter;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const UploadLetterTemplatePage = async () => {
  const clientConfig = await fetchClient();

  const campaignIds = getCampaignIds(clientConfig);

  if (campaignIds.length === 0) {
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
    letterVersion: 'PDF',
  };

  return (
    <NHSNotifyContainer>
      <LetterTemplateForm
        initialState={initialState}
        campaignIds={campaignIds}
      />
    </NHSNotifyContainer>
  );
};

export default UploadLetterTemplatePage;
