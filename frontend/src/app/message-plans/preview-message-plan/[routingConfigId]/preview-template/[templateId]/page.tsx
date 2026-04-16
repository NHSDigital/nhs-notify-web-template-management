import { MessagePlanAndTemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewLetterFromMessagePlan } from '@molecules/PreviewLetterFromMessagePlan/PreviewLetterFromMessagePlan';

const { pageTitle } = content.pages.previewMessagePlanPreviewLetter;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewLetterTemplateFromPreviewMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => <PreviewLetterFromMessagePlan {...props} />;

export default PreviewLetterTemplateFromPreviewMessagePlan;
