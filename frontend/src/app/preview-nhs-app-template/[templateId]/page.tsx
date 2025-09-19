'use server';

import { Metadata } from 'next';
import { PreviewNHSAppTemplate } from '@forms/PreviewNHSAppTemplate/PreviewNHSAppTemplate';
import {
  PageProps,
  validateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import content from '@content/content';
import { serverIsFeatureEnabled } from '@utils/server-features';

const { pageTitle } = content.components.previewNHSAppTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewNhsAppTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const routingEnabled = await serverIsFeatureEnabled('routing');

  return (
    <PreviewNHSAppTemplate
      initialState={validatedTemplate}
      routingEnabled={routingEnabled}
    />
  );
};

export default PreviewNhsAppTemplatePage;
