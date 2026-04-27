'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplates } from '@utils/form-actions';
import { ChooseTemplateFromMessagePlan } from '@molecules/ChooseTemplateFromMessagePlan/ChooseTemplateFromMessagePlan';
import content from '@content/content';

const { pageTitle, pageHeading } =
  content.pages.chooseOtherLanguageLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseOtherLanguageLetterTemplate(
  props: MessagePlanPageProps
) {
  return ChooseTemplateFromMessagePlan({
    props,
    variant: 'language',
    channel: 'LETTER',
    templateListFetcher: (campaignId) =>
      getTemplates({
        templateType: 'LETTER',
        letterType: 'x0',
        excludeLanguage: 'en',
        templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
        letterVersion: 'AUTHORING',
        campaignId,
      }),
    pageHeading,
  });
}
