'use server';

import {
  $PdfLetterTemplate,
  TemplatePageProps,
  zodValidate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewSubmittedTemplate } from '@molecules/PreviewSubmittedTemplate/PreviewSubmittedTemplate';
import PreviewTemplateDetailsPdfLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsPdfLetter';
import { NHSNotifyContainer } from '@layouts/container/container';
import { z } from 'zod';

const { pageTitle } = content.pages.previewSubmittedLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedLetterTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate(
    z.intersection(
      $PdfLetterTemplate,
      z.object({
        templateStatus: z.literal('SUBMITTED'),
      })
    ),
    template
  );

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <PreviewSubmittedTemplate
        initialState={validatedTemplate}
        previewComponent={PreviewTemplateDetailsPdfLetter}
      />
    </NHSNotifyContainer>
  );
};

export default PreviewSubmittedLetterTemplatePage;
