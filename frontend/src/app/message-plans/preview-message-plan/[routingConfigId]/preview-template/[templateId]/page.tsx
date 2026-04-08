import {
  MessagePlanAndTemplatePageProps,
  validateAuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { SummaryLetterFromMessagePlan } from '@molecules/SummaryLetterFromMessagePlan/SummaryLetterFromMessagePlan';

const { pageTitle } = content.pages.previewMessagePlanPreviewLetter;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewLetterTemplateFromPreviewMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => (
  <SummaryLetterFromMessagePlan
    {...props}
    validateTemplate={validateAuthoringLetterTemplate}
  />
);

export default PreviewLetterTemplateFromPreviewMessagePlan;
