import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import copy from '@content/content';
import * as UploadDocxLetterTemplateForm from '@forms/UploadDocxLetterTemplateForm';
import { NHSNotifyContainer } from '@layouts/container/container';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { fetchClient } from '@utils/server-features';
import { getCampaignIds } from '@utils/client-config';
import { uploadOtherLanguageLetterTemplate } from './server-action';

const content = copy.pages.uploadDocxLetterTemplatePage('language');

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default async function UploadOtherLanguageLetterTemplatePage() {
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
        <NHSNotifyFormProvider serverAction={uploadOtherLanguageLetterTemplate}>
          <NHSNotifyForm.ErrorSummary />
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-two-thirds'>
              <h1 className='nhsuk-heading-xl'>{content.heading}</h1>
            </div>
          </div>
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-two-thirds'>
              <NHSNotifyForm.Form formId='upload-large-print-letter-template'>
                <UploadDocxLetterTemplateForm.NameField />
                <UploadDocxLetterTemplateForm.CampaignIdField
                  campaignIds={campaignIds}
                />
                <UploadDocxLetterTemplateForm.LanguageField />
                <UploadDocxLetterTemplateForm.FileField />
                <NHSNotifyButton type='submit'>
                  {content.submitButton.text}
                </NHSNotifyButton>
              </NHSNotifyForm.Form>
            </div>

            <div className='nhsuk-grid-column-one-third'>
              <ContentRenderer content={content.sideBar} />
            </div>
          </div>
        </NHSNotifyFormProvider>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
