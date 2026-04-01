import {
  MessagePlanAndTemplatePageProps,
  validateLargePrintLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';

const { pageTitle } = content.pages.previewLargePrintLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewLargePrintLetterTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => (
  <SummaryPreviewLetter
    {...props}
    validateTemplate={validateLargePrintLetterTemplate}
  />
);

export default PreviewLargePrintLetterTemplateFromMessagePlan;
