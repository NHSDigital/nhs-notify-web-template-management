'use server';

import {
  PageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { PreviewLetterTemplate } from '@organisms/PreviewLetterTemplate/PreviewLetterTemplate';
import content from '@content/content';
import type { Metadata } from 'next';
import { getSessionServer } from '@utils/amplify-utils';

const { pageTitle } = content.components.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const { userSub } = await getSessionServer();

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <PreviewLetterTemplate template={validatedTemplate} user={userSub} />;
};

export default PreviewLetterTemplatePage;
