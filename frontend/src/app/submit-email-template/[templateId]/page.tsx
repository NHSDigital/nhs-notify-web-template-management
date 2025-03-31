'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import {
  PageProps,
  validateEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';

const { pageTitle } = content.components.submitTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle.EMAIL,
  };
}

const SubmitEmailTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <SubmitTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-email-template'
      submitPath='email-template-submitted'
    />
  );
};

export default SubmitEmailTemplatePage;
