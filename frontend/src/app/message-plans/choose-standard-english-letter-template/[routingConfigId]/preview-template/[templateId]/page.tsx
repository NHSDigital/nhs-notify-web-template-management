import {
  MessagePlanAndTemplatePageProps,
  validateLetterTemplate,
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

const PreviewStandardEnglishLetterTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  const { routingConfigId } = await props.params;
  return (
    <SummaryPreviewLetter
      {...props}
      validateTemplate={validateLetterTemplate}
      redirectUrl={`/message-plans/edit-message-plan/${routingConfigId}`}
    />
  );
};

export default PreviewStandardEnglishLetterTemplateFromMessagePlan;
