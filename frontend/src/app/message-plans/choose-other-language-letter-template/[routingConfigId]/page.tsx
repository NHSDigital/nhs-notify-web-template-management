'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';
import { ChooseLanguageLetterTemplates } from '@forms/ChooseLanguageLetterTemplates/ChooseLanguageLetterTemplates';
import { getForeignLanguageLetterTemplates } from '@utils/form-actions';

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
  const { routingConfigId } = await props.params;

  const [messagePlan, foreignLanguageTemplates] = await Promise.all([
    getRoutingConfig(routingConfigId),
    getForeignLanguageLetterTemplates(),
  ]);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const cascadeIndex = messagePlan.cascade.findIndex(
    (item) => item.channel === 'LETTER'
  );

  if (cascadeIndex === -1) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  return (
    <ChooseLanguageLetterTemplates
      messagePlan={messagePlan}
      pageHeading={pageHeading}
      templateList={foreignLanguageTemplates}
      cascadeIndex={cascadeIndex}
    />
  );
}
