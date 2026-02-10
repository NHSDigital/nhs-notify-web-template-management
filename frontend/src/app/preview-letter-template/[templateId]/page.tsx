import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import type { Metadata } from 'next';
import type { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { PreviewPdfLetterTemplate } from '@organisms/PreviewLetterTemplate/PreviewLetterTemplate';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getTemplate } from '@utils/form-actions';
import { getTemplateStatusErrors } from '@utils/get-template-status-errors';
import { submitAuthoringLetterAction } from './server-action';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle, backLinkText, submitText, links } =
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

  // PDF letter version - uses original component unchanged from main
  if (validatedTemplate.letterVersion === 'PDF') {
    return <PreviewPdfLetterTemplate template={validatedTemplate} />;
  }

  // Authoring letter version
  const showRenderer =
    validatedTemplate.templateStatus === 'NOT_YET_SUBMITTED' &&
    Boolean(validatedTemplate.files.initialRender);

  return (
    <NHSNotifyContainer fullWidth={showRenderer}>
      <NHSNotifyFormProvider
        initialState={{
          errorState: {
            formErrors: getTemplateStatusErrors(validatedTemplate),
          },
        }}
        serverAction={submitAuthoringLetterAction}
      >
        <div className='nhsuk-width-container'>
          <NHSNotifyBackLink href={links.messageTemplates}>
            {backLinkText}
          </NHSNotifyBackLink>
          <NHSNotifyForm.ErrorSummary />
        </div>
        <NHSNotifyMain>
          <div className='nhsuk-width-container'>
            <div className='nhsuk-grid-row'>
              <div className='nhsuk-grid-column-full'>
                <PreviewTemplateDetailsAuthoringLetter
                  template={validatedTemplate}
                />
              </div>
            </div>
          </div>
          {showRenderer && (
            <>
              <LetterRender template={validatedTemplate} />
              <NHSNotifyForm.Form formId='preview-letter-template'>
                <input
                  type='hidden'
                  name='templateId'
                  value={validatedTemplate.id}
                />
                <input
                  type='hidden'
                  name='lockNumber'
                  value={validatedTemplate.lockNumber}
                />
                <button
                  type='submit'
                  className='nhsuk-button'
                  data-testid='preview-letter-template-cta'
                  id='preview-letter-template-cta'
                >
                  {submitText}
                </button>
              </NHSNotifyForm.Form>
            </>
          )}
          <p>
            <Link href={links.messageTemplates}>{backLinkText}</Link>
          </p>
        </NHSNotifyMain>
      </NHSNotifyFormProvider>
    </NHSNotifyContainer>
  );
}
