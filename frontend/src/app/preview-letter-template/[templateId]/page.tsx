import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import type { Metadata } from 'next';
import type { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyMainFluid } from '@atoms/NHSNotifyMainFluid/NHSNotifyMainFluid';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { PreviewLetterContent } from '@organisms/PreviewLetterTemplate/PreviewLetterContent';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getTemplate } from '@utils/form-actions';
import { getTemplateStatusErrors } from '@utils/get-template-status-errors';
import { submitAuthoringLetterAction } from './server-action';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle, backLinkText, links } =
  content.components.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function PreviewLetterTemplatePage({
  params,
}: TemplatePageProps) {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  // PDF letter version - will be removed soon, keeping separate
  if (validatedTemplate.letterVersion === 'PDF') {
    return (
      <NHSNotifyFormProvider
        initialState={{
          errorState: {
            formErrors: getTemplateStatusErrors(validatedTemplate),
          },
        }}
        serverAction={async (state) => state} // PDF version doesn't have submit action on this page
      >
        <NHSNotifyBackLink href={links.messageTemplates}>
          {backLinkText}
        </NHSNotifyBackLink>
        <NHSNotifyMain>
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-full'>
              <PreviewLetterContent template={validatedTemplate} />
            </div>
          </div>
        </NHSNotifyMain>
      </NHSNotifyFormProvider>
    );
  }

  // Authoring letter version
  return (
    <NHSNotifyContainer>
      <NHSNotifyFormProvider
        initialState={{
          errorState: {
            formErrors: getTemplateStatusErrors(validatedTemplate),
          },
        }}
        serverAction={submitAuthoringLetterAction}
      >
        <NHSNotifyBackLink href={links.messageTemplates}>
          {backLinkText}
        </NHSNotifyBackLink>
        <NHSNotifyMainFluid>
          <div className='nhsuk-width-container'>
            <div className='nhsuk-grid-row'>
              <div className='nhsuk-grid-column-full'>
                <PreviewTemplateDetailsAuthoringLetter
                  template={validatedTemplate}
                />
              </div>
            </div>
          </div>
          <LetterRender template={validatedTemplate} />
          <div className='nhsuk-width-container nhsuk-u-margin-top-6'>
            <p>
              <Link href={links.messageTemplates}>{backLinkText}</Link>
            </p>
          </div>
        </NHSNotifyMainFluid>
      </NHSNotifyFormProvider>
    </NHSNotifyContainer>
  );
}
