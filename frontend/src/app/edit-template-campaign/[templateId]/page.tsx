import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import type { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { HintText, Label } from '@atoms/nhsuk-components';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import copy from '@content/content';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getCampaignIds } from '@utils/client-config';
import { getTemplate } from '@utils/form-actions';
import { fetchClient } from '@utils/server-features';
import { editTemplateCampaign } from './server-action';

const content = copy.pages.editTemplateCampaignPage;

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default async function EditTemplateCampaignPage({
  params,
}: TemplatePageProps) {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  const client = await fetchClient();

  const campaignIds = getCampaignIds(client);

  if (!template) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  if (template.templateType !== 'LETTER') {
    return redirect('/message-templates', RedirectType.replace);
  }

  const previewUrl =
    template.templateStatus === 'SUBMITTED'
      ? `/preview-submitted-letter-template/${templateId}`
      : `/preview-letter-template/${templateId}`;

  if (
    template.templateStatus === 'SUBMITTED' ||
    template.letterVersion !== 'AUTHORING' ||
    campaignIds.length < 2
  ) {
    return redirect(previewUrl, RedirectType.replace);
  }

  if (!client?.features.letterAuthoring) {
    return redirect('/message-templates', RedirectType.replace);
  }

  return (
    <NHSNotifyMain>
      <NHSNotifyFormProvider
        initialState={{ fields: { campaignId: template.campaignId } }}
        serverAction={editTemplateCampaign}
      >
        <NHSNotifyForm.ErrorSummary />
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <NHSNotifyForm.Form formId='edit-template-name'>
              <input
                type='hidden'
                name='templateId'
                value={templateId}
                readOnly
              />
              <input
                type='hidden'
                name='lockNumber'
                value={template.lockNumber}
                readOnly
              />
              <NHSNotifyForm.FormGroup htmlFor='campaignId'>
                <Label size='l' isPageHeading htmlFor='campaignId'>
                  {content.form.campaignId.label}
                </Label>
                <HintText>{content.form.campaignId.hint}</HintText>
                <NHSNotifyForm.ErrorMessage htmlFor='campaignId' />
                <NHSNotifyForm.Select id='campaignId' name='campaignId'>
                  <option />
                  {campaignIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </NHSNotifyForm.Select>
              </NHSNotifyForm.FormGroup>
              <NHSNotifyForm.FormGroup>
                <NHSNotifyButton type='submit'>
                  {content.form.submit.text}
                </NHSNotifyButton>
                <Link
                  href={content.backLink.href(templateId)}
                  className='nhsuk-u-display-inline-block nhsuk-u-font-size-19 nhsuk-u-margin-3'
                  data-testid='back-link-bottom'
                >
                  {content.backLink.text}
                </Link>
              </NHSNotifyForm.FormGroup>
            </NHSNotifyForm.Form>
          </div>
        </div>
      </NHSNotifyFormProvider>
    </NHSNotifyMain>
  );
}
