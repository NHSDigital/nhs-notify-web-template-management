'use server';

import {
  TemplatePageProps,
  validateSubmittedLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewSubmittedTemplate } from '@molecules/PreviewSubmittedTemplate/PreviewSubmittedTemplate';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.components.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedLetterTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedLetterTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <PreviewSubmittedTemplate
        initialState={validatedTemplate}
        previewComponent={PreviewTemplateDetailsLetter}
      />
    </NHSNotifyContainer>
  );
};

export default PreviewSubmittedLetterTemplatePage;
