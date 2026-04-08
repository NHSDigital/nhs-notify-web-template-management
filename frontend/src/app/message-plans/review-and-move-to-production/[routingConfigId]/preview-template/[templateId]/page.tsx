import {
  MessagePlanAndTemplatePageProps,
  validateAuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { SummaryLetterFromMessagePlan } from '@molecules/SummaryLetterFromMessagePlan/SummaryLetterFromMessagePlan';

const { pageTitle } = content.pages.reviewAndMoveToProductionPreviewLetter;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewLetterTemplateFromReviewAndMoveToProduction = async (
  props: MessagePlanAndTemplatePageProps
) => (
  <SummaryLetterFromMessagePlan
    {...props}
    validateTemplate={validateAuthoringLetterTemplate}
  />
);

export default PreviewLetterTemplateFromReviewAndMoveToProduction;
