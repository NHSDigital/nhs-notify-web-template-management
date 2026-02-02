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
import { $LockNumber } from 'nhs-notify-backend-client';

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

  if (
    !validatedTemplate ||
    validatedTemplate.letterVersion !== 'PDF' ||
    !validatedTemplate.proofingEnabled
  ) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <RequestProof
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      channel={validatedTemplate.templateType}
      lockNumber={lockNumberResult.data}
    />
  );
};

export default RequestProofPage;
