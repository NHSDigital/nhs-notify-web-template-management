import type { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import copy from '@content/content';
import * as UploadDocxLetterTemplateForm from '@forms/UploadDocxLetterTemplateForm/form';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { fetchClient } from '@utils/server-features';
import { getCampaignIds } from '@utils/client-config';
import { uploadLargePrintLetterTemplate } from './server-action';

const content = copy.pages.uploadDocxLetterTemplatePage('x1');

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default async function UploadLargePrintLetterTemplatePage() {
  const client = await fetchClient();
  const campaignIds = getCampaignIds(client);

  if (campaignIds.length === 0) {
    return redirect(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  }

  return (
    <>
      <NHSNotifyBackLink href={content.backLink.href}>
        {content.backLink.text}
      </NHSNotifyBackLink>
      <NHSNotifyMain>
        <NHSNotifyFormProvider serverAction={uploadLargePrintLetterTemplate}>
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-two-thirds'>
              <h1 className='nhsuk-heading-xl'>{content.heading}</h1>
            </div>
          </div>
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-two-thirds'>
              <UploadDocxLetterTemplateForm.Form formId='upload-large-print-letter-template'>
                <UploadDocxLetterTemplateForm.NameField />
                <UploadDocxLetterTemplateForm.CampaignIdField
                  campaignIds={campaignIds}
                />
                <UploadDocxLetterTemplateForm.FileField />
              </UploadDocxLetterTemplateForm.Form>
            </div>

            <div className='nhsuk-grid-column-one-third'>
              <ContentRenderer content={content.sideBar} />
            </div>
          </div>
        </NHSNotifyFormProvider>
      </NHSNotifyMain>
    </>
  );
}
