import {
  MessagePlanAndTemplatePageProps,
  validateEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import { PreviewDigitalTemplateFromChooseTemplate } from '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate';

const { pageTitle } = content.components.previewEmailTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default function PreviewEmailTemplateFromMessagePlan(
  props: MessagePlanAndTemplatePageProps
) {
  return PreviewDigitalTemplateFromChooseTemplate({
    ...props,
    validateTemplate: validateEmailTemplate,
    detailsComponent: PreviewTemplateDetailsEmail,
  });
}
