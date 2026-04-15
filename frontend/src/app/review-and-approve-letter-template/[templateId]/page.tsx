'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import {
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
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
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import concatClassNames from '@utils/concat-class-names';
import { buildLetterRenderUrl } from '@utils/letter-render-url';

const {
  pageTitle,
  goBackButtonText,
  goBackPath,
  shortExampleHeading,
  longExampleHeading,
  submitText,
  pageHeading,
  headerCaption,
  iframe,
} = content.pages.reviewAndApproveLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const ReviewAndApproveLetterTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate || validatedTemplate.letterVersion !== 'AUTHORING') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (
    !lockNumberResult.success ||
    lockNumberResult.data !== validatedTemplate.lockNumber ||
    // since lock number is unchanged, the following should never be true
    !validatedTemplate.letterVariantId ||
    validatedTemplate.files.longFormRender?.status !== 'RENDERED' ||
    validatedTemplate.files.shortFormRender?.status !== 'RENDERED'
  ) {
    return redirect(
      `/preview-letter-template/${templateId}`,
      RedirectType.replace
    );
  }

  const { longFormRender, shortFormRender } = validatedTemplate.files;

  const letterVariant = await getLetterVariantById(
    validatedTemplate.letterVariantId
  );

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyFormProvider
          serverAction={reviewAndApproveLetterTemplateAction}
        >
          <div className='nhsuk-u-reading-width'>
            <span className='nhsuk-caption-l'>{headerCaption}</span>
            <h1 data-testid='preview-message__heading'>
              {interpolate(pageHeading, {
                templateName: validatedTemplate.name,
              })}
            </h1>
          </div>
          <PreviewTemplateDetailsAuthoringLetterTable
            template={validatedTemplate}
            letterVariant={letterVariant}
            hideEditActions
            hideLearnMore
          />
          <h2 className='nhsuk-heading-m'>{shortExampleHeading}</h2>
          <LetterRenderIframe
            className={concatClassNames(
              styles.iframe,
              'nhsuk-u-margin-bottom-6'
            )}
            src={buildLetterRenderUrl(
              validatedTemplate,
              shortFormRender.fileName
            )}
            title={interpolate(iframe.title, { tab: 'short' })}
            aria-label={interpolate(iframe.ariaLabel, { tab: 'short' })}
          />
          <h2 className='nhsuk-heading-m'>{longExampleHeading}</h2>
          <LetterRenderIframe
            className={concatClassNames(
              styles.iframe,
              'nhsuk-u-margin-bottom-6'
            )}
            src={buildLetterRenderUrl(
              validatedTemplate,
              longFormRender.fileName
            )}
            title={interpolate(iframe.title, { tab: 'long' })}
            aria-label={interpolate(iframe.ariaLabel, { tab: 'long' })}
          />
          <NHSNotifyForm.Form formId='review-and-approve-letter'>
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
              <NHSNotifyButton type='submit'>{submitText}</NHSNotifyButton>

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
