import {
  MessagePlanAndTemplatePageProps,
  zodValidate,
  $AuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { Metadata } from 'next';
import content from '@content/content';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';

const { pageTitle } = content.pages.previewStandardEnglishLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const validateAuthoringLetterTemplate = (template?: TemplateDto) =>
  zodValidate($AuthoringLetterTemplate, template);

const PreviewLetterTemplateFromPreviewMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => (
  <SummaryPreviewLetter
    {...props}
    validateTemplate={validateAuthoringLetterTemplate}
    hideBackLinks
  />
);

export default PreviewLetterTemplateFromPreviewMessagePlan;
