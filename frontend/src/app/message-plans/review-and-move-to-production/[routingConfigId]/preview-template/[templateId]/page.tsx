import {
  MessagePlanAndTemplatePageProps,
  validateAuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';

const { pageTitle } = content.pages.previewStandardEnglishLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewLetterTemplateFromReviewAndMoveToProduction = async (
  props: MessagePlanAndTemplatePageProps
) => (
  <SummaryPreviewLetter
    {...props}
    validateTemplate={validateAuthoringLetterTemplate}
    hideBackLinks
  />
);

export default PreviewLetterTemplateFromReviewAndMoveToProduction;
