import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import type { Metadata } from 'next';
import type {
  AuthoringLetterTemplate,
  TemplatePageProps,
} from 'nhs-notify-web-template-management-utils';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { PreviewPdfLetterTemplate } from '@organisms/PreviewPdfLetterTemplate/PreviewPdfLetterTemplate';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getTemplate } from '@utils/form-actions';
import { submitAuthoringLetterAction } from './server-action';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle, backLinkText, submitText, links, validationErrorMessages } =
  content.components.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

function getValidationErrors(template: AuthoringLetterTemplate): string[] {
  if (template.templateStatus !== 'VALIDATION_FAILED') return [];

  return (
    template.validationErrors?.flatMap(
      // istanbul ignore next - unreachable since all errors allowed template by validation are mapped
      (error) => validationErrorMessages[error] ?? []
    ) ?? []
  );
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

  if (validatedTemplate.letterVersion === 'PDF') {
    return (
      <NHSNotifyContainer>
        <PreviewPdfLetterTemplate template={validatedTemplate} />
      </NHSNotifyContainer>
    );
  }

  // AUTHORING letter
  const showRenderer = Boolean(validatedTemplate.files.initialRender);

  const showSubmitForm =
    validatedTemplate.templateStatus === 'NOT_YET_SUBMITTED';

  // TODO: CCM-13495
  // all of this might need to become a client component
  // because lock number will change when updating previews

  return (
    <NHSNotifyContainer fullWidth={showRenderer}>
      <NHSNotifyFormProvider
        initialState={{
          errorState: {
            formErrors: getValidationErrors(validatedTemplate),
          },
        }}
        serverAction={submitAuthoringLetterAction}
      >
        <div className='nhsuk-width-container'>
          <NHSNotifyBackLink href={links.messageTemplates}>
            {backLinkText}
          </NHSNotifyBackLink>
        </div>
        <NHSNotifyMain>
          <div className='nhsuk-width-container'>
            <NHSNotifyForm.ErrorSummary />
            <div className='nhsuk-grid-row'>
              <div className='nhsuk-grid-column-full'>
                <PreviewTemplateDetailsAuthoringLetter
                  template={validatedTemplate}
                />
              </div>
            </div>
          </div>
          {showRenderer && <LetterRender template={validatedTemplate} />}
          {showSubmitForm && (
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
          )}
          <p>
            <Link href={links.messageTemplates}>{backLinkText}</Link>
          </p>
        </NHSNotifyMain>
      </NHSNotifyFormProvider>
    </NHSNotifyContainer>
  );
}
