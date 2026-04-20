'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplates } from '@utils/form-actions';
import { ChooseTemplateFromMessagePlan } from '@molecules/ChooseTemplateFromMessagePlan/ChooseTemplateFromMessagePlan';
import content from '@content/content';

const { pageTitle, pageHeading, noTemplatesText, hintText } =
  content.pages.chooseLetterTemplatePage('x1');

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseLargePrintLetterTemplate(
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
        letterType: 'x1',
        templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
        letterVersion: 'AUTHORING',
        campaignId,
      }),
    pageHeading,
    noTemplatesText,
    hintText,
    accessibleFormat: 'x1',
  });
}
