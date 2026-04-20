'use server';

import { redirect, RedirectType } from 'next/navigation';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import type {
  Channel,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { FrontendSupportedAccessibleFormats } from 'nhs-notify-web-template-management-utils';
import { getRoutingConfig } from '@utils/message-plans';
import { ChooseChannelTemplate } from '@forms/ChooseChannelTemplate';
import { ChooseLanguageLetterTemplates } from '@forms/ChooseLanguageLetterTemplates/ChooseLanguageLetterTemplates';
import { NHSNotifyContainer } from '@layouts/container/container';

type ChannelVariantProps = {
  variant: 'single';
  templateListFetcher: (
    campaignId: string | undefined
  ) => Promise<TemplateDto[]>;
  noTemplatesText: string;
  hintText: string;
  accessibleFormat?: FrontendSupportedAccessibleFormats;
};

type LanguageVariantProps = {
  variant: 'language';
  templateListFetcher: (
    campaignId: string | undefined
  ) => Promise<LetterTemplate[]>;
};

export type ChooseTemplateFromMessagePlanProps = {
  props: MessagePlanPageProps;
  pageHeading: string;
  channel: Channel;
} & (ChannelVariantProps | LanguageVariantProps);

export async function ChooseTemplateFromMessagePlan(
  componentProps: ChooseTemplateFromMessagePlanProps
) {
  const { props, pageHeading, channel } = componentProps;
  const { routingConfigId } = await props.params;
  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/edit-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  const cascadeIndex = messagePlan.cascade.findIndex(
    (item) => item.channel === channel
  );

  if (cascadeIndex === -1) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  if (componentProps.variant === 'language') {
    const templateList = await componentProps.templateListFetcher(
      messagePlan.campaignId
    );

    return (
      <NHSNotifyContainer>
        <ChooseLanguageLetterTemplates
          messagePlan={messagePlan}
          pageHeading={pageHeading}
          templateList={templateList}
          cascadeIndex={cascadeIndex}
          lockNumber={lockNumberResult.data}
        />
      </NHSNotifyContainer>
    );
  }

  const templateList = await componentProps.templateListFetcher(
    messagePlan.campaignId
  );

  return (
    <NHSNotifyContainer>
      <ChooseChannelTemplate
        messagePlan={messagePlan}
        pageHeading={pageHeading}
        noTemplatesText={componentProps.noTemplatesText}
        hintText={componentProps.hintText}
        templateList={templateList}
        cascadeIndex={cascadeIndex}
        lockNumber={lockNumberResult.data}
        accessibleFormat={componentProps.accessibleFormat}
      />
    </NHSNotifyContainer>
  );
}
