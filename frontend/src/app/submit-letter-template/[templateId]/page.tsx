'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import {
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { SubmitLetterTemplate } from '@forms/SubmitTemplate/SubmitLetterTemplate';
import { $LockNumber } from 'nhs-notify-backend-client';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Submit letter template',
  };
}

const SubmitLetterTemplatePage = async (props: TemplatePageProps) => {
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

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <SubmitLetterTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      lockNumber={lockNumberResult.data}
    />
  );
};

export default SubmitLetterTemplatePage;
