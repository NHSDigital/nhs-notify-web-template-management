'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import {
  AuthoringLetterTemplate,
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { reviewAndApproveLetterTemplateAction } from './server-action';
import { PreviewTemplateDetailsAuthoringLetterTable } from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';
import { getBasePath } from '@utils/get-base-path';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import styles from './ReviewAndApproveLetterTemplatePage.module.scss';
import { interpolate } from '@utils/interpolate';

const {
  pageTitle,
  goBackButtonText,
  goBackPath,
  shortExampleHeading,
  longExampleHeading,
  submitText,
  pageHeading,
  headerCaption,
} = content.pages.reviewAndApproveLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

function buildPdfUrl(template: AuthoringLetterTemplate, fileName: string) {
  const basePath = getBasePath();
  return `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;
}

function derivePdfUrl(
  template: AuthoringLetterTemplate,
  tab: 'longFormRender' | 'shortFormRender'
): string | null {
  const render = template.files[tab];

  return render?.status === 'RENDERED'
    ? buildPdfUrl(template, render.fileName)
    : null;
}

const ReviewAndApproveLetterTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate || validatedTemplate.letterVersion !== 'AUTHORING') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyFormProvider
          serverAction={reviewAndApproveLetterTemplateAction}
        >
          <div className='nhsuk-u-reading-width'>
            <span className='nhsuk-caption-l'>{headerCaption}</span>
            <h1 data-testid='preview-message__heading'>{pageHeading}</h1>
          </div>
          <PreviewTemplateDetailsAuthoringLetterTable
            template={validatedTemplate}
            hideEditActions
            hideLearnMore
          />
          <h2 className='nhsuk-heading-m'>{shortExampleHeading}</h2>
          <LetterRenderIframe
            className={styles.iframe}
            tab='shortFormRender'
            pdfUrl={derivePdfUrl(validatedTemplate, 'shortFormRender')}
          />
          <h2 className='nhsuk-heading-m'>{longExampleHeading}</h2>
          <LetterRenderIframe
            className={styles.iframe}
            tab='longFormRender'
            pdfUrl={derivePdfUrl(validatedTemplate, 'longFormRender')}
          />
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
            <div className='nhsuk-form-group'>
              <NHSNotifyButton
                type='submit'
                data-testid='preview-letter-template-cta'
                id='preview-letter-template-cta'
              >
                {submitText}
              </NHSNotifyButton>

              <NHSNotifyButton
                secondary
                id='go-back-button'
                href={interpolate(goBackPath, {
                  templateId: validatedTemplate.id,
                  basePath: getBasePath(),
                })}
                data-testid='back-link-bottom'
                className='nhsuk-u-margin-left-3'
              >
                {goBackButtonText}
              </NHSNotifyButton>
            </div>
          </NHSNotifyForm.Form>
        </NHSNotifyFormProvider>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};

export default ReviewAndApproveLetterTemplatePage;
