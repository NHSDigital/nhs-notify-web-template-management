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
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyWarningCallout } from '@atoms/NHSNotifyWarningCallout/NHSNotifyWarningCallout';
import {
  Details,
  DetailsSummary,
  DetailsText,
  Tag,
} from '@atoms/nhsuk-components';
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
import { MessagePlanChannelTemplateCard } from '@molecules/MessagePlanChannelTemplateCard/MessagePlanChannelTemplateCard';
import {
  MessagePlanCascadeConditionalTemplatesList,
  MessagePlanCascadeConditionalTemplatesListItem,
} from '@molecules/MessagePlanConditionalTemplates/MessagePlanConditionalTemplates';
import {
  MessagePlanFallbackConditionsDetails,
  MessagePlanFallbackConditionsListItem,
} from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';
import {
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
    <>
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
            <NHSNotifyWarningCallout>
              {/* TODO: CCM-12038 - link shouldn't open in new tab */}
              <ContentRenderer
                content={pageContent.warningCallout}
                variables={{ routingConfigId }}
              />
            </NHSNotifyWarningCallout>

            <NHSNotifySummaryList>
              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>
                  Routing Plan ID
                </NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue className='monospace-font'>
                  {routingConfigId}
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>

              <NHSNotifySummaryListRow>
                <NHSNotifySummaryListKey>Status</NHSNotifySummaryListKey>
                <NHSNotifySummaryListValue>
                  <Tag color={messagePlanStatusToTagColour(messagePlan.status)}>
                    {messagePlanStatusToDisplayText(messagePlan.status)}
                  </Tag>
                </NHSNotifySummaryListValue>
              </NHSNotifySummaryListRow>
            </NHSNotifySummaryList>

            <DetailsOpenProvider targetClassName='preview-template-details'>
              <p>
                <DetailsOpenButton />
              </p>

              <MessagePlanChannelList>
                {messagePlan.cascade.map((cascadeItem, index) => {
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
                        <MessagePlanChannelTemplateCard
                          heading={channelDisplayMappings(cascadeItem.channel)}
                        >
                          {cascadeItem.channel === 'LETTER' ? (
                            <p>
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
                              <p>{defaultTemplate.name}</p>
                              <Details className='nhsuk-u-margin-bottom-0 preview-template-details'>
                                <DetailsSummary>
                                  Preview template
                                </DetailsSummary>
                                <DetailsText>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        renderTemplateMarkdown(defaultTemplate),
                                    }}
                                  />
                                </DetailsText>
                              </Details>
                            </>
                          )}
                        </MessagePlanChannelTemplateCard>

                        {conditionalTemplatesCount > 0 && (
                          <MessagePlanCascadeConditionalTemplatesList>
                            <MessagePlanFallbackConditionsListItem>
                              <MessagePlanFallbackConditionsDetails
                                channel={cascadeItem.channel}
                                className='preview-template-details'
                                index={index}
                              />
                            </MessagePlanFallbackConditionsListItem>
                            {accessibleTemplates.map(
                              ([accessibleFormat, template]) => (
                                <MessagePlanCascadeConditionalTemplatesListItem
                                  key={template.id}
                                >
                                  <MessagePlanChannelTemplateCard
                                    heading={`${accessibleFormatDisplayMappings(
                                      accessibleFormat
                                    )} (optional)`}
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
                                  </MessagePlanChannelTemplateCard>
                                </MessagePlanCascadeConditionalTemplatesListItem>
                              )
                            )}

                            {languageTemplates.length > 0 && (
                              <MessagePlanCascadeConditionalTemplatesListItem>
                                <MessagePlanChannelTemplateCard
                                  heading={
                                    pageContent.languageFormatsCardHeading
                                  }
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
                                </MessagePlanChannelTemplateCard>
                              </MessagePlanCascadeConditionalTemplatesListItem>
                            )}
                          </MessagePlanCascadeConditionalTemplatesList>
                        )}
                      </MessagePlanBlock>

                      {messagePlan.cascade.length > 1 &&
                        index < messagePlan.cascade.length - 1 && (
                          <MessagePlanFallbackConditionsListItem>
                            <MessagePlanFallbackConditionsDetails
                              channel={cascadeItem.channel}
                              className='preview-template-details'
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
    </>
  );
}
