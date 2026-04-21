import {
  MessagePlanAndTemplatePageProps,
  validateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import { PreviewDigitalTemplateFromChooseTemplate } from '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate';

const { pageTitle } = content.components.previewNHSAppTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewNhsAppTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  return PreviewDigitalTemplateFromChooseTemplate({
    ...props,
    validateTemplate: validateNHSAppTemplate,
    detailsComponent: PreviewTemplateDetailsNhsApp,
  });
};

export default PreviewNhsAppTemplateFromMessagePlan;
