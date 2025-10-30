'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { RequestProof } from '@forms/RequestProof/RequestProof';
import {
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';
import { serverIsFeatureEnabled } from '@utils/server-features';

const { pageTitle } = content.components.requestProof;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const RequestProofPage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const proofingEnabled = await serverIsFeatureEnabled('proofing');

  if (!proofingEnabled) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate || !validatedTemplate.proofingEnabled) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <RequestProof
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      channel={validatedTemplate.templateType}
      lockNumber={validatedTemplate.lockNumber}
    />
  );
};

export default RequestProofPage;
