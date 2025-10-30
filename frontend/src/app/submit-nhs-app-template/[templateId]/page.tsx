'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
import {
  TemplatePageProps,
  validateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';

const { pageTitle } = content.components.submitTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle.NHS_APP,
  };
}

const SubmitNhsAppTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <SubmitDigitalTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      channel='NHS_APP'
      lockNumber={validatedTemplate.lockNumber}
    />
  );
};

export default SubmitNhsAppTemplatePage;
