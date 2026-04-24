import {
  MessagePlanAndTemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewLetterFromChooseTemplate } from '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate';

const { pageTitle } = content.pages.previewStandardEnglishLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewStandardEnglishLetterTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  return PreviewLetterFromChooseTemplate({
    ...props,
    validateTemplate: validateLetterTemplate,
  });
};

export default PreviewStandardEnglishLetterTemplateFromMessagePlan;
