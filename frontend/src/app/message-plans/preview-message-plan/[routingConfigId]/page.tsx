import { Fragment } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import {
  accessibleFormatDisplayMappings,
  channelDisplayMappings,
  messagePlanStatusToDisplayText,
  messagePlanStatusToTagColour,
  type MessagePlanPageProps,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyWarningCallout } from '@atoms/NHSNotifyWarningCallout/NHSNotifyWarningCallout';
import { DetailsSummary, DetailsText, Tag } from '@atoms/nhsuk-components';
import {
  NHSNotifySummaryList,
  NHSNotifySummaryListKey,
  NHSNotifySummaryListRow,
  NHSNotifySummaryListValue,
} from '@atoms/NHSNotifySummaryList/NHSNotifySummaryList';
import content from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { MessagePlanChannelList } from '@molecules/MessagePlanChannelList/MessagePlanChannelList';
import { MessagePlanChannelCard } from '@molecules/MessagePlanChannelCard/MessagePlanChannelCard';
import {
  MessagePlanConditionalTemplatesList,
  MessagePlanConditionalTemplatesListItem,
} from '@molecules/MessagePlanConditionalTemplatesList/MessagePlanConditionalTemplatesList';
import {
  MessagePlanFallbackConditionsDetails,
  MessagePlanFallbackConditionsListItem,
} from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';
import {
  ControlledDetails,
  DetailsOpenButton,
  DetailsOpenProvider,
} from '@providers/details-open';
import { interpolate } from '@utils/interpolate';
import {
  getMessagePlanTemplates,
  getRoutingConfig,
} from '@utils/message-plans';
import { renderTemplateMarkdown } from '@utils/render-template-markdown';
import {
  getAccessibleTemplatesForCascadeItem,
  getDefaultTemplateForItem,
  getLanguageTemplatesForCascadeItem,
} from '@utils/routing-utils';

const pageContent = content.pages.previewMessagePlan;

export const metadata: Metadata = {
  title: pageContent.pageTitle,
};

export default async function PreviewMessagePlanPage({
  params,
}: MessagePlanPageProps) {
  const { routingConfigId } = await params;

  const messagePlan = await getRoutingConfig(routingConfigId);

  if (!messagePlan) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  if (messagePlan.status === 'DRAFT') {
    return redirect(
      `/message-plans/choose-templates/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const templates = await getMessagePlanTemplates(messagePlan);

  return (
    <NHSNotifyContainer>
      <Link
        href={pageContent.backLink.href}
        className='nhsuk-back-link'
        data-testid='back-link-top'
      >
        {pageContent.backLink.text}
      </Link>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-three-quarters'>
            <span className='nhsuk-caption-l'>{pageContent.headerCaption}</span>
            <h1 className='nhsuk-heading-l'>{messagePlan.name}</h1>
            <NHSNotifyWarningCallout data-testid='warning-callout'>
              <ContentRenderer
                content={pageContent.warningCallout}
                variables={{ routingConfigId }}
              />
            </NHSNotifyWarningCallout>

            <NHSNotifySummaryList data-testid='message-plan-details'>
              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>
                  {pageContent.summaryTable.rowHeadings.id}
                </NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue
                  className='monospace-font'
                  data-testid='plan-id'
                >
                  {routingConfigId}
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>

              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>
                  {pageContent.summaryTable.rowHeadings.campaignId}
                </NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue
                  className='monospace-font'
                  data-testid='campaign-id'
                >
                  {messagePlan.campaignId}
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>

              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>
                  {pageContent.summaryTable.rowHeadings.status}
                </NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue data-testid='status'>
                  <Tag color={messagePlanStatusToTagColour(messagePlan.status)}>
                    {messagePlanStatusToDisplayText(messagePlan.status)}
                  </Tag>
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>
            </NHSNotifySummaryList>

            <DetailsOpenProvider>
              {messagePlan.cascade.some((item) => item.channel !== 'LETTER') ? (
                <p>
                  <DetailsOpenButton
                    secondary
                    openText={pageContent.detailsOpenButton.openText}
                    closedText={pageContent.detailsOpenButton.closedText}
                  />
                </p>
              ) : null}

              <MessagePlanChannelList data-testid='cascade-channel-list'>
                {messagePlan.cascade.map((cascadeItem, index) => {
                  const channelDisplayName = channelDisplayMappings(
                    cascadeItem.channel
                  );

                  const defaultTemplate = getDefaultTemplateForItem(
                    cascadeItem,
                    templates
                  );

                  const accessibleTemplates =
                    getAccessibleTemplatesForCascadeItem(
                      cascadeItem,
                      templates
                    );

                  const languageTemplates = getLanguageTemplatesForCascadeItem(
                    cascadeItem,
                    templates
                  );

                  const conditionalTemplatesCount =
                    accessibleTemplates.length + languageTemplates.length;

                  if (!defaultTemplate) {
                    return null;
                  }
                  return (
                    <Fragment key={`channel-${index + 1}`}>
                      <MessagePlanBlock
                        index={index}
                        data-testid={`message-plan-block-${cascadeItem.channel}`}
                      >
                        <MessagePlanChannelCard
                          heading={channelDisplayName}
                          data-testid='channel-card'
                        >
                          {cascadeItem.channel === 'LETTER' ? (
                            <p data-testid='template-name'>
                              <Link
                                href={interpolate(
                                  '/preview-submitted-letter-template/{{id}}',
                                  { id: defaultTemplate.id }
                                )}
                              >
                                {defaultTemplate.name}
                              </Link>
                            </p>
                          ) : (
                            <>
                              <p data-testid='template-name'>
                                {defaultTemplate.name}
                              </p>
                              <ControlledDetails className='nhsuk-u-margin-bottom-0'>
                                <DetailsSummary data-testid='preview-template-summary'>
                                  Preview{' '}
                                  <span className='nhsuk-u-visually-hidden'>
                                    {channelDisplayName}
                                  </span>{' '}
                                  template
                                </DetailsSummary>
                                <DetailsText data-testid='preview-template-text'>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        renderTemplateMarkdown(defaultTemplate),
                                    }}
                                  />
                                </DetailsText>
                              </ControlledDetails>
                            </>
                          )}
                        </MessagePlanChannelCard>

                        {conditionalTemplatesCount > 0 && (
                          <MessagePlanConditionalTemplatesList data-testid='conditional-templates'>
                            <MessagePlanFallbackConditionsListItem data-testid='conditional-templates-fallback-conditions'>
                              <MessagePlanFallbackConditionsDetails
                                component={ControlledDetails}
                                channel={cascadeItem.channel}
                                index={index}
                              />
                            </MessagePlanFallbackConditionsListItem>
                            {accessibleTemplates.map(
                              ([accessibleFormat, template]) => (
                                <MessagePlanConditionalTemplatesListItem
                                  key={template.id}
                                  data-testid={`conditional-template-${accessibleFormat}`}
                                >
                                  <MessagePlanChannelCard
                                    heading={`${accessibleFormatDisplayMappings(
                                      accessibleFormat
                                    )} (optional)`}
                                    data-testid='channel-card'
                                  >
                                    <p>
                                      <Link
                                        href={interpolate(
                                          '/preview-submitted-letter-template/{{id}}',
                                          { id: template.id }
                                        )}
                                      >
                                        {template.name}
                                      </Link>
                                    </p>
                                  </MessagePlanChannelCard>
                                </MessagePlanConditionalTemplatesListItem>
                              )
                            )}

                            {languageTemplates.length > 0 && (
                              <MessagePlanConditionalTemplatesListItem
                                data-testid={'conditional-template-languages'}
                              >
                                <MessagePlanChannelCard
                                  heading={
                                    pageContent.languageFormatsCardHeading
                                  }
                                  data-testid='channel-card'
                                >
                                  {languageTemplates.map((template) => (
                                    <p
                                      key={template.id}
                                      className='nhsuk-u-margin-bottom-0'
                                    >
                                      <Link
                                        href={interpolate(
                                          '/preview-submitted-letter-template/{{id}}',
                                          { id: template.id }
                                        )}
                                      >
                                        {template.name}
                                      </Link>
                                    </p>
                                  ))}
                                </MessagePlanChannelCard>
                              </MessagePlanConditionalTemplatesListItem>
                            )}
                          </MessagePlanConditionalTemplatesList>
                        )}
                      </MessagePlanBlock>

                      {messagePlan.cascade.length > 1 &&
                        index < messagePlan.cascade.length - 1 && (
                          <MessagePlanFallbackConditionsListItem
                            data-testid={`message-plan-fallback-conditions-${cascadeItem.channel}`}
                          >
                            <MessagePlanFallbackConditionsDetails
                              component={ControlledDetails}
                              channel={cascadeItem.channel}
                              index={index}
                            />
                          </MessagePlanFallbackConditionsListItem>
                        )}
                    </Fragment>
                  );
                })}
              </MessagePlanChannelList>
            </DetailsOpenProvider>

            <div className='nhsuk-form-group'>
              <p>
                <Link
                  href={pageContent.backLink.href}
                  data-testid='back-link-bottom'
                >
                  {pageContent.backLink.text}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
