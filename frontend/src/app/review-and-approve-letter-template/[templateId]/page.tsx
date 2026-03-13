'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import {
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';
import { $LockNumber } from 'nhs-notify-backend-client';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import Link from 'next/link';
import { reviewAndApproveLetterTemplateAction } from './server-action';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';

const { pageTitle } = content.pages.reviewAndApproveLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const ReviewAndApproveLetterTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/preview-letter-template/${templateId}`,
      RedirectType.replace
    );
  }

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
          <PreviewTemplateDetailsAuthoringLetter template={validatedTemplate} />
          <LetterRenderIframe tab='shortFormRender' pdfUrl='' />
          <LetterRenderIframe tab='longFormRender' pdfUrl='' />
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
              {'submitText'}
            </button>
          </NHSNotifyForm.Form>

          <p>
            <Link href={'links.messageTemplates'}>{'backLinkText'}</Link>
          </p>
        </NHSNotifyFormProvider>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};

export default ReviewAndApproveLetterTemplatePage;
