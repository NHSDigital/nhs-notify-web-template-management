'use server';

import {
  PageProps,
  validateSubmittedLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { ViewLetterTemplate } from '@molecules/ViewLetterTemplate/ViewLetterTemplate';
import { getSessionServer } from '@utils/amplify-utils';

const { pageTitle } = content.components.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const { userSub } = await getSessionServer();

  const validatedTemplate = validateSubmittedLetterTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ViewLetterTemplate initialState={validatedTemplate} user={userSub} />;
};

export default PreviewSubmittedLetterTemplatePage;
