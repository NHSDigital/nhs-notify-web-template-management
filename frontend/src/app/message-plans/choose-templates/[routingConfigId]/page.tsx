import { Fragment } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import {
  accessibleFormatDisplayMappings,
  channelDisplayMappings,
  channelToTemplateType,
  messagePlanChooseTemplateUrl,
  MessagePlanPageProps,
  messagePlanStatusToDisplayText,
  messagePlanStatusToTagColour,
} from 'nhs-notify-web-template-management-utils';
import {
  SummaryList,
  SummaryListKey,
  SummaryListRow,
  SummaryListValue,
  Tag,
} from '@atoms/nhsuk-components';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import copy from '@content/content';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { MessagePlanChannelCard } from '@molecules/MessagePlanChannelCard/MessagePlanChannelCard';
import {
  MessagePlanConditionalTemplatesList,
  MessagePlanConditionalTemplatesListItem,
} from '@molecules/MessagePlanConditionalTemplatesList/MessagePlanConditionalTemplatesList';
import {
  MessagePlanFallbackConditionsDetails,
  MessagePlanFallbackConditionsListItem,
} from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';
import { MessagePlanChannelList } from '@molecules/MessagePlanChannelList/MessagePlanChannelList';
import { MessagePlanChooseTemplateCardContent } from '@organisms/MessagePlanChooseTemplateCardContent/MessagePlanChooseTemplateCardContent';
import { interpolate } from '@utils/interpolate';
import {
  getRoutingConfig,
  getMessagePlanTemplates,
} from '@utils/message-plans';
import {
  ACCESSIBLE_FORMATS,
  getConditionalTemplatesForItem,
  getDefaultTemplateForItem,
  getLanguageTemplatesForCascadeItem,
  getTemplateForAccessibleFormat,
} from '@utils/routing-utils';

import { removeTemplateFromMessagePlan } from './actions';

const content = copy.pages.chooseTemplatesForMessagePlan;

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default async function ChooseTemplatesPage(props: MessagePlanPageProps) {
  const { routingConfigId } = await props.params;

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  if (messagePlan.status === 'COMPLETED') {
    return redirect(
      `/message-plans/preview-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const templates = await getMessagePlanTemplates(messagePlan);

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-three-quarters'>
          <span className='nhsuk-caption-l'>{content.headerCaption}</span>
          <h1 className='nhsuk-heading-l' data-testid='routing-config-name'>
            {messagePlan.name}
          </h1>
          <p className='nhsuk-body-s'>
            <Link
              data-testid='edit-settings-link'
              href={interpolate(content.changeNameLink.href, {
                routingConfigId: messagePlan.id,
              })}
            >
              {content.changeNameLink.text}
            </Link>
          </p>

          <SummaryList className='nhsuk-u-margin-bottom-7 nhsuk-u-margin-top-6'>
            <SummaryListRow>
              <SummaryListKey>
                {content.rowHeadings.routingPlanId}
              </SummaryListKey>
              <SummaryListValue
                data-testid='routing-config-id'
                className='monospace-font'
              >
                {messagePlan.id}
              </SummaryListValue>
            </SummaryListRow>
            <SummaryListRow>
              <SummaryListKey>{content.rowHeadings.campaignId}</SummaryListKey>
              <SummaryListValue
                data-testid='campaign-id'
                className='monospace-font'
              >
                {messagePlan.campaignId}
              </SummaryListValue>
            </SummaryListRow>
            <SummaryListRow>
              <SummaryListKey>{content.rowHeadings.status}</SummaryListKey>
              <SummaryListValue>
                <Tag color={messagePlanStatusToTagColour(messagePlan.status)}>
                  {messagePlanStatusToDisplayText(messagePlan.status)}
                </Tag>
              </SummaryListValue>
            </SummaryListRow>
          </SummaryList>

          <MessagePlanChannelList>
            {messagePlan.cascade.map((cascadeItem, index) => {
              const defaultTemplate = getDefaultTemplateForItem(
                cascadeItem,
                templates
              );

              const channelTemplateType = channelDisplayMappings(
                cascadeItem.channel
              );

              const conditionalTemplates = getConditionalTemplatesForItem(
                cascadeItem,
                templates
              );

              const languageTemplates = getLanguageTemplatesForCascadeItem(
                cascadeItem,
                conditionalTemplates
              );

              return (
                <Fragment key={`channel-${index + 1}`}>
                  <MessagePlanBlock
                    index={index}
                    data-testid={`message-plan-block-${cascadeItem.channel}`}
                  >
                    <MessagePlanChannelCard
                      data-testid={`channel-template-${cascadeItem.channel}`}
                      heading={channelTemplateType}
                    >
                      <MessagePlanChooseTemplateCardContent
                        channelTemplateType={channelTemplateType}
                        templates={defaultTemplate ? [defaultTemplate] : []}
                        routingConfigId={messagePlan.id}
                        lockNumber={messagePlan.lockNumber}
                        chooseTemplateUrl={`/message-plans/${messagePlanChooseTemplateUrl(channelToTemplateType(cascadeItem.channel))}/${messagePlan.id}?lockNumber=${messagePlan.lockNumber}`}
                        removeTemplateAction={removeTemplateFromMessagePlan}
                        testIdSuffix={cascadeItem.channel}
                      />
                    </MessagePlanChannelCard>

                    {cascadeItem.channel === 'LETTER' ? (
                      <MessagePlanConditionalTemplatesList data-testid='message-plan-conditional-templates'>
                        <MessagePlanFallbackConditionsListItem
                          data-testid={`message-plan-fallback-conditions-${cascadeItem.channel}`}
                        >
                          <MessagePlanFallbackConditionsDetails
                            channel={cascadeItem.channel}
                            index={index}
                          />
                        </MessagePlanFallbackConditionsListItem>

                        {ACCESSIBLE_FORMATS.map((format) => {
                          const template = getTemplateForAccessibleFormat(
                            format,
                            cascadeItem,
                            conditionalTemplates
                          );
                          const formatDisplay =
                            accessibleFormatDisplayMappings(format);

                          return (
                            <MessagePlanConditionalTemplatesListItem
                              key={format}
                            >
                              <MessagePlanChannelCard
                                data-testid={`channel-template-${format}`}
                                heading={`${formatDisplay} (optional)`}
                              >
                                <MessagePlanChooseTemplateCardContent
                                  channelTemplateType={formatDisplay}
                                  templates={template ? [template] : []}
                                  routingConfigId={messagePlan.id}
                                  chooseTemplateUrl={`/message-plans/${messagePlanChooseTemplateUrl('LETTER', format)}/${messagePlan.id}?lockNumber=${messagePlan.lockNumber}`}
                                  lockNumber={messagePlan.lockNumber}
                                  removeTemplateAction={
                                    removeTemplateFromMessagePlan
                                  }
                                  testIdSuffix={format}
                                />
                              </MessagePlanChannelCard>
                            </MessagePlanConditionalTemplatesListItem>
                          );
                        })}

                        <MessagePlanConditionalTemplatesListItem>
                          <MessagePlanChannelCard
                            data-testid='channel-template-foreign-language'
                            heading={`${content.messagePlanConditionalLetterTemplates.languageFormats} (optional)`}
                          >
                            <MessagePlanChooseTemplateCardContent
                              channelTemplateType={
                                content.messagePlanConditionalLetterTemplates
                                  .languageFormats
                              }
                              templates={languageTemplates}
                              routingConfigId={messagePlan.id}
                              lockNumber={messagePlan.lockNumber}
                              chooseTemplateUrl={`/message-plans/${messagePlanChooseTemplateUrl('LETTER', 'language')}/${messagePlan.id}?lockNumber=${messagePlan.lockNumber}`}
                              removeTemplateAction={
                                removeTemplateFromMessagePlan
                              }
                              testIdSuffix='foreign-language'
                            />
                          </MessagePlanChannelCard>
                        </MessagePlanConditionalTemplatesListItem>

                        <MessagePlanConditionalTemplatesListItem>
                          Hello
                        </MessagePlanConditionalTemplatesListItem>
                      </MessagePlanConditionalTemplatesList>
                    ) : null}
                  </MessagePlanBlock>

                  {/* Show fallback conditions only if there is more than one channel, and not for the last channel */}
                  {messagePlan.cascade.length > 1 &&
                    index < messagePlan.cascade.length - 1 && (
                      <MessagePlanFallbackConditionsListItem
                        data-testid={`message-plan-fallback-conditions-${cascadeItem.channel}`}
                      >
                        <MessagePlanFallbackConditionsDetails
                          channel={cascadeItem.channel}
                          index={index}
                        />
                      </MessagePlanFallbackConditionsListItem>
                    )}
                </Fragment>
              );
            })}
          </MessagePlanChannelList>

          <div className='nhsuk-form-group' data-testid='message-plan-actions'>
            <Link
              href={interpolate(content.ctas.primary.href, {
                routingConfigId: messagePlan.id,
              })}
              passHref
              legacyBehavior
            >
              <NHSNotifyButton data-testid='move-to-production-cta'>
                {content.ctas.primary.text}
              </NHSNotifyButton>
            </Link>
            <Link href={content.ctas.secondary.href} passHref legacyBehavior>
              <NHSNotifyButton
                secondary
                data-testid='save-and-close-cta'
                className='nhsuk-u-margin-left-3'
              >
                {content.ctas.secondary.text}
              </NHSNotifyButton>
            </Link>
          </div>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
