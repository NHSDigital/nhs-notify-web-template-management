import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import type { Metadata } from 'next';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';
import type {
  AuthoringLetterTemplate,
  TemplatePageProps,
} from 'nhs-notify-web-template-management-utils';
import {
  getPreviewURL,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { PreviewPdfLetterTemplate } from '@organisms/PreviewPdfLetterTemplate/PreviewPdfLetterTemplate';
import { PollLetterRender } from '@molecules/PollLetterRender/PollLetterRender';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { LetterRenderPollingProvider } from '@providers/letter-render-polling-provider';
import { LetterSubmitButton } from '@molecules/LetterRender/LetterSubmitButton';
import { submitAuthoringLetterAction } from './server-action';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';
import styles from './page.module.scss';
import concatClassNames from '@utils/concat-class-names';
import { buildLetterRenderUrl } from '@utils/letter-render-url';

const {
  approveButtonText,
  backLinkText,
  links,
  loadingText,
  pageTitle,
  uploadSuccessBanner,
  validationErrorMessages,
  defaultValidationErrorMessage,
  validationFailedIframe,
} = content.pages.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

function getValidationErrors(template: AuthoringLetterTemplate) {
  if (template.templateStatus !== 'VALIDATION_FAILED') return [];

  if (template.validationErrors && template.validationErrors.length > 0) {
    return template.validationErrors.map((error) =>
      validationErrorMessages[error.name](error.issues ?? [])
    );
  }

  return [defaultValidationErrorMessage];
}

function getInitialRenderDetails(template: AuthoringLetterTemplate): {
  rendered: boolean;
  src?: string;
} {
  if (template.files.initialRender.status !== 'RENDERED') {
    return { rendered: false };
  }

  return {
    rendered: true,
    src: buildLetterRenderUrl(template, template.files.initialRender.fileName),
  };
}

export default async function PreviewLetterTemplatePage({
  params,
  searchParams,
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
  if (
    ['SUBMITTED', 'PROOF_APPROVED'].includes(validatedTemplate.templateStatus)
  ) {
    return redirect(getPreviewURL(validatedTemplate), RedirectType.replace);
  }

  const initialRender = getInitialRenderDetails(validatedTemplate);
  const showRenderer = initialRender.rendered;
  const showTabbedRenderer =
    showRenderer && validatedTemplate.templateStatus !== 'VALIDATION_FAILED';

  const showSubmitForm =
    validatedTemplate.templateStatus === 'NOT_YET_SUBMITTED';

  let letterVariant: LetterVariant | undefined;

  if (validatedTemplate.letterVariantId) {
    letterVariant = await getLetterVariantById(
      validatedTemplate.letterVariantId
    );
  }

  const validationErrors = getValidationErrors(validatedTemplate);

  const search = await searchParams;

  const isFromUploadPage = search?.from === 'upload';

  return (
    <NHSNotifyContainer fullWidth={showTabbedRenderer}>
      <NHSNotifyFormProvider
        key={validatedTemplate.templateStatus}
        initialState={{
          errorState: {
            formErrors: validationErrors,
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
                    {isFromUploadPage &&
                      validatedTemplate.templateStatus ===
                        'NOT_YET_SUBMITTED' && (
                        <section
                          className='notify-confirmation-panel nhsuk-heading-l'
                          role='status'
                        >
                          {uploadSuccessBanner}
                        </section>
                      )}
                    <PreviewTemplateDetailsAuthoringLetter
                      template={validatedTemplate}
                      letterVariant={letterVariant}
                    />
                  </div>
                </div>
              </NHSNotifyContainer>
              {showRenderer &&
                (showTabbedRenderer ? (
                  <LetterRender template={validatedTemplate} />
                ) : (
                  <LetterRenderIframe
                    className={concatClassNames(
                      styles.iframe,
                      'nhsuk-u-margin-bottom-6'
                    )}
                    src={initialRender.src}
                    title={validationFailedIframe.title}
                    aria-label={validationFailedIframe.ariaLabel}
                  />
                ))}
              <NHSNotifyContainer fullWidth={showTabbedRenderer}>
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
                    <LetterSubmitButton>{approveButtonText}</LetterSubmitButton>
                  </NHSNotifyForm.Form>
                )}
                <p>
                  {validationErrors.length > 0 ? (
                    <NHSNotifyButton
                      href={links.uploadDifferentTemplateFile.href}
                    >
                      {links.uploadDifferentTemplateFile.text}
                    </NHSNotifyButton>
                  ) : (
                    <Link
                      data-testid='back-link-bottom'
                      href={links.messageTemplates}
                    >
                      {backLinkText}
                    </Link>
                  )}
                </p>
              </NHSNotifyContainer>
            </NHSNotifyMain>
          </PollLetterRender>
        </LetterRenderPollingProvider>
      </NHSNotifyFormProvider>
    </NHSNotifyContainer>
  );
}
