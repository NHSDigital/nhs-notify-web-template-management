'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import {
  PageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { SubmitLetterTemplate } from '@forms/SubmitTemplate/SubmitLetterTemplate';
import { serverIsFeatureEnabled } from '@utils/server-features';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Submit letter template',
  };
}

const SubmitLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const clientProofingEnabled = await serverIsFeatureEnabled('proofing');
  const globalProofingEnabled =
    process.env.NEXT_PUBLIC_ENABLE_PROOFING === 'true';

  const proofingEnabled = clientProofingEnabled && globalProofingEnabled;

  return (
    <SubmitLetterTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      proofingEnabled={proofingEnabled}
    />
  );
};

export default SubmitLetterTemplatePage;
