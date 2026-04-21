import {
  MessagePlanAndTemplatePageProps,
  validateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { PreviewDigitalTemplateFromChooseTemplate } from '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate';

const { pageTitle } = content.components.previewSMSTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewTextMessageTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  return PreviewDigitalTemplateFromChooseTemplate({
    ...props,
    validateTemplate: validateSMSTemplate,
    detailsComponent: PreviewTemplateDetailsSms,
  });
};

export default PreviewTextMessageTemplateFromMessagePlan;
