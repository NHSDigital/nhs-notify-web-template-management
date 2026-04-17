'use server';

import {
  TemplatePageProps,
  validateSubmittedPdfLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewSubmittedDigitalTemplate } from '@molecules/PreviewSubmittedDigitalTemplate/PreviewSubmittedDigitalTemplate';
import PreviewTemplateDetailsPdfLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsPdfLetter';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.pages.previewSubmittedLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedLetterTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedPdfLetterTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <PreviewSubmittedDigitalTemplate
        template={validatedTemplate}
        DetailComponent={PreviewTemplateDetailsPdfLetter}
      />
    </NHSNotifyContainer>
  );
};

export default PreviewSubmittedLetterTemplatePage;
