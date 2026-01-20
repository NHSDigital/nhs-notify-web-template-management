'use server';

import { Metadata } from 'next';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';
import { ChooseChannelTemplate } from '@forms/ChooseChannelTemplate';
import { getTemplates } from '@utils/form-actions';
import { $LockNumber } from 'nhs-notify-backend-client';

import content from '@content/content';
const { pageTitle, pageHeading } = content.pages.chooseLargePrintLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

export default async function ChooseLargePrintLetterTemplate(
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

  const [messagePlan, availableTemplateList] = await Promise.all([
    getRoutingConfig(routingConfigId),
    getTemplates({
      templateType: 'LETTER',
      language: 'en',
      letterType: 'x1',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
    }),
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
    <ChooseChannelTemplate
      messagePlan={messagePlan}
      pageHeading={pageHeading}
      templateList={availableTemplateList}
      cascadeIndex={cascadeIndex}
      accessibleFormat='x1'
      lockNumber={lockNumberResult.data}
    />
  );
}
