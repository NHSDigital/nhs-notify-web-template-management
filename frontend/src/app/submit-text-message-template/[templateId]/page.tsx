'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { $LockNumber } from 'nhs-notify-backend-client';
import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
import {
  TemplatePageProps,
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

const SubmitSmsTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/preview-text-message-template/${templateId}`,
      RedirectType.replace
    );
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <SubmitDigitalTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      channel='SMS'
      lockNumber={lockNumberResult.data}
    />
  );
};

export default SubmitSmsTemplatePage;
