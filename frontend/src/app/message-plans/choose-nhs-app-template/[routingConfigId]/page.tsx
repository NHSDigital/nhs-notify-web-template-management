'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { getTemplates } from '@utils/form-actions';
import { ChooseTemplateFromMessagePlan } from '@molecules/ChooseTemplateFromMessagePlan/ChooseTemplateFromMessagePlan';

const { pageTitle, pageHeading, noTemplatesText, hintText } =
  content.pages.chooseDigitalTemplatePage('NHS_APP');

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseNhsAppTemplate(
  props: MessagePlanPageProps
) {
  return ChooseTemplateFromMessagePlan({
    props,
    variant: 'single',
    channel: 'NHSAPP',
    templateListFetcher: () => getTemplates({ templateType: 'NHS_APP' }),
    pageHeading,
    noTemplatesText,
    hintText,
  });
}
