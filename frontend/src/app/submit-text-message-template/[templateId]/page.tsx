'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
import {
  PageProps,
  validateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';

const { pageTitle } = content.components.submitTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle.SMS,
  };
}

const SubmitSmsTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <SubmitDigitalTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-text-message-template'
      submitPath='text-message-template-submitted'
    />
  );
};

export default SubmitSmsTemplatePage;
