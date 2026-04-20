'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { getTemplates } from '@utils/form-actions';
import { ChooseTemplateFromMessagePlan } from '@molecules/ChooseTemplateFromMessagePlan/ChooseTemplateFromMessagePlan';

const { pageTitle, pageHeading, noTemplatesText, hintText } =
  content.pages.chooseLetterTemplatePage('x0');

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseStandardEnglishLetterTemplate(
  props: MessagePlanPageProps
) {
  return ChooseTemplateFromMessagePlan({
    props,
    variant: 'single',
    channel: 'LETTER',
    templateListFetcher: (campaignId) =>
      getTemplates({
        templateType: 'LETTER',
        language: 'en',
        letterType: 'x0',
        templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
        letterVersion: 'AUTHORING',
        campaignId,
      }),
    pageHeading,
    noTemplatesText,
    hintText,
  });
}
