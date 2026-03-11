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
import { PollLetterRender } from '@molecules/PollLetterRender/PollLetterRender';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { LetterRenderPollingProvider } from '@providers/letter-render-polling-provider';
import { getTemplate } from '@utils/form-actions';
import { LetterSubmitButton } from '@molecules/LetterRender/LetterSubmitButton';
import { submitAuthoringLetterAction } from './server-action';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const {
  pageTitle,
  backLinkText,
  submitText,
  loadingText,
  links,
  validationErrorMessages,
} = content.pages.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

function getValidationErrors(template: AuthoringLetterTemplate): string[] {
  if (template.templateStatus !== 'VALIDATION_FAILED') return [];

  return (
    template.validationErrors?.flatMap(
      (error) => validationErrorMessages[error.name]
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
  const showRenderer =
    validatedTemplate.files.initialRender.status === 'RENDERED';

  const showSubmitForm =
    validatedTemplate.templateStatus === 'NOT_YET_SUBMITTED';

  return (
    <NHSNotifyContainer fullWidth={showRenderer}>
      <NHSNotifyFormProvider
        key={validatedTemplate.templateStatus}
        initialState={{
          errorState: {
            formErrors: getValidationErrors(validatedTemplate),
          },
        }}
        serverAction={submitAuthoringLetterAction}
      >
        <LetterRenderPollingProvider>
          <PollLetterRender
            template={validatedTemplate}
            mode='initialRender'
            loadingElement={<h1>{loadingText}</h1>}
          >
            <NHSNotifyContainer>
              <NHSNotifyBackLink href={links.messageTemplates}>
                {backLinkText}
              </NHSNotifyBackLink>
            </NHSNotifyContainer>
            <NHSNotifyMain>
              <NHSNotifyContainer>
                <NHSNotifyForm.ErrorSummary />
                <div className='nhsuk-grid-row'>
                  <div className='nhsuk-grid-column-full'>
                    <PreviewTemplateDetailsAuthoringLetter
                      template={validatedTemplate}
                    />
                  </div>
                </div>
              </NHSNotifyContainer>
              {showRenderer && <LetterRender template={validatedTemplate} />}
              <NHSNotifyContainer fullWidth={showRenderer}>
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
                    <LetterSubmitButton>{submitText}</LetterSubmitButton>
                  </NHSNotifyForm.Form>
                )}
                <p>
                  <Link href={links.messageTemplates}>{backLinkText}</Link>
                </p>
              </NHSNotifyContainer>
            </NHSNotifyMain>
          </PollLetterRender>
        </LetterRenderPollingProvider>
      </NHSNotifyFormProvider>
    </NHSNotifyContainer>
  );
}
