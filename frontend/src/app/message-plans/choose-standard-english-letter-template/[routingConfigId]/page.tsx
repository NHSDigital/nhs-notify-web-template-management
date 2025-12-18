'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';

import content from '@content/content';
import { ChooseChannelTemplate } from '@forms/ChooseChannelTemplate';
import { getTemplates } from '@utils/form-actions';
import { $LockNumber } from 'nhs-notify-backend-client';
const { pageTitle, pageHeading } =
  content.pages.chooseStandardEnglishLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseStandardEnglishLetterTemplate(
  props: MessagePlanPageProps
) {
  const { routingConfigId } = await props.params;

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/choose-templates/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const cascadeIndex = messagePlan.cascade.findIndex(
    (item) => item.channel === 'LETTER'
  );

  if (cascadeIndex === -1) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const availableTemplateList = await getTemplates({
    templateType: 'LETTER',
    language: 'en',
    letterType: 'x0',
  });

  return (
    <ChooseChannelTemplate
      messagePlan={messagePlan}
      pageHeading={pageHeading}
      templateList={availableTemplateList}
      cascadeIndex={cascadeIndex}
      lockNumber={lockNumberResult.data}
    />
  );
}
