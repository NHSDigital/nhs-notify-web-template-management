import {
  TemplatePageProps,
  validateSubmittedSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewSubmittedDigitalTemplate } from '@molecules/PreviewSubmittedDigitalTemplate/PreviewSubmittedDigitalTemplate';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.components.previewSMSTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedSMSTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedSMSTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <PreviewSubmittedDigitalTemplate
        template={validatedTemplate}
        detailsComponent={PreviewTemplateDetailsSms}
      />
    </NHSNotifyContainer>
  );
};

export default PreviewSubmittedSMSTemplatePage;
