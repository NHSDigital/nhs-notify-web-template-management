'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { RequestProof } from '@forms/RequestProof/RequestProof';
import {
  PageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';

const { pageTitle } = content.components.submitTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle.EMAIL,
  };
}

const RequestProofPage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <RequestProof
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-email-template'
      confirmPath='email-template-submitted'
    />
  );
};

export default RequestProofPage;
