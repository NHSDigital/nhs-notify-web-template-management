'use server';

import {
  MessagePlanAndTemplatePageProps,
  validateBritishSignLanguageLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewLetterFromChooseTemplate } from '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate';

const { pageTitle } = content.pages.previewBritishSignLanguageLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewBritishSignLanguageLetterTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  return PreviewLetterFromChooseTemplate({
    ...props,
    validateTemplate: validateBritishSignLanguageLetterTemplate,
  });
};

export default PreviewBritishSignLanguageLetterTemplateFromMessagePlan;
