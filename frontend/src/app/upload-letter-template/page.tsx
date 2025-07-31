import { Metadata } from 'next';
import { CreateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import { getSessionServer } from '@utils/amplify-utils';
import { redirect, RedirectType } from 'next/navigation';
import { fetchClient } from '@utils/server-features';
import content from '@content/content';

const { pageTitle } = content.components.templateFormLetter;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const CreateLetterTemplatePage = async () => {
  const initialState: CreateLetterTemplate = {
    templateType: 'LETTER',
    name: '',
    letterType: 'x0',
    language: 'en',
  };

  const sessionServer = await getSessionServer();
  const { accessToken, clientId } = sessionServer;

  if (!accessToken || !clientId) {
    return redirect(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  }

  const clientConfiguration = await fetchClient(accessToken);

  const campaignId = clientConfiguration?.data?.campaignId;

  if (!campaignId) {
    return redirect(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  }

  return <LetterTemplateForm initialState={initialState} />;
};

export default CreateLetterTemplatePage;
