'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { $LockNumber } from 'nhs-notify-backend-client';
import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
import {
  TemplatePageProps,
  validateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.components.submitTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle.NHS_APP,
  };
}

const SubmitNhsAppTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/preview-nhs-app-template/${templateId}`,
      RedirectType.replace
    );
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <SubmitDigitalTemplate
        templateName={validatedTemplate.name}
        templateId={validatedTemplate.id}
        channel='NHS_APP'
        lockNumber={lockNumberResult.data}
      />
    </NHSNotifyContainer>
  );
};

export default SubmitNhsAppTemplatePage;
