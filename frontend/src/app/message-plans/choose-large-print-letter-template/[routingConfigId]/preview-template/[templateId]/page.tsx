import {
  MessagePlanAndTemplatePageProps,
  validateLargePrintLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewLetterFromChooseTemplate } from '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate';

const { pageTitle } = content.pages.previewLargePrintLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewLargePrintLetterTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  return (
    <PreviewLetterFromChooseTemplate
      {...props}
      validateTemplate={validateLargePrintLetterTemplate}
    />
  );
};

export default PreviewLargePrintLetterTemplateFromMessagePlan;
