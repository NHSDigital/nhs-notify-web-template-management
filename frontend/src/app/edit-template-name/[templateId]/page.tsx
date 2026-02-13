import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import type { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyContainer } from '@layouts/container/container';
import { HintText, Label } from '@atoms/nhsuk-components';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import copy from '@content/content';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getTemplate } from '@utils/form-actions';
import { fetchClient } from '@utils/server-features';
import { editTemplateName } from './server-action';

const content = copy.pages.editTemplateNamePage;

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default async function EditTemplateNamePage({
  params,
}: TemplatePageProps) {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  const client = await fetchClient();

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
    template.letterVersion !== 'AUTHORING'
  ) {
    return redirect(previewUrl, RedirectType.replace);
  }

  if (!client?.features.letterAuthoring) {
    return redirect('/message-templates', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyFormProvider
          initialState={{ fields: { name: template.name } }}
          serverAction={editTemplateName}
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
                <NHSNotifyForm.FormGroup htmlFor='name'>
                  <Label size='l' isPageHeading htmlFor='name'>
                    {content.form.name.label}
                  </Label>
                  <HintText>{content.form.name.hint}</HintText>

                  <TemplateNameGuidance className='nhsuk-u-margin-top-3' />
                  <NHSNotifyForm.ErrorMessage htmlFor='name' />
                  <NHSNotifyForm.Input
                    type='text'
                    id='name'
                    name='name'
                    className='nhsuk-u-margin-bottom-2'
                  />
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
    </NHSNotifyContainer>
  );
}
