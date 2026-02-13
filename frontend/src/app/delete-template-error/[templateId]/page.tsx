'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { getRoutingConfigReferencesByTemplateId } from '@utils/message-plans';
import DeleteTemplateError from '@molecules/DeleteTemplateError/DeleteTemplateError';
import { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyContainer } from '@layouts/container/container';

import content from '@content/content';
const title = content.pages.deleteTemplateErrorPage.pageTitle;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
  };
}

export default async function DeleteTemplateErrorPage(
  props: TemplatePageProps
) {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  if (!template) {
    return redirect('/message-templates', RedirectType.replace);
  }

  const messagePlans = await getRoutingConfigReferencesByTemplateId(templateId);

  if (messagePlans.length === 0) {
    return redirect('/message-templates', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <DeleteTemplateError
        templateName={template.name}
        messagePlans={messagePlans}
      />
    </NHSNotifyContainer>
  );
}
