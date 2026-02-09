'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import type { RoutingConfig, TemplateDto } from 'nhs-notify-backend-client';
import {
  accessibleFormatDisplayMappings,
  channelDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import { DetailsSummary, DetailsText } from '@atoms/nhsuk-components';
import content from '@content/content';
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
import { renderTemplateMarkdown } from '@utils/render-template-markdown';
import {
  getAccessibleTemplatesForCascadeItem,
  getDefaultTemplateForItem,
  getLanguageTemplatesForCascadeItem,
  type MessagePlanTemplates,
} from '@utils/routing-utils';

const pageContent = content.components.messagePlanCascadePreview;

function getLetterTemplatePreviewHref(template: TemplateDto): string {
  const linkTemplate =
    template.templateStatus === 'SUBMITTED'
      ? pageContent.letterTemplateLinks.previewSubmitted
      : pageContent.letterTemplateLinks.preview;
  return interpolate(linkTemplate, { id: template.id });
}

export type MessagePlanCascadePreviewProps = {
  messagePlan: RoutingConfig;
  templates: MessagePlanTemplates;
};

export function MessagePlanCascadePreview({
  messagePlan,
  templates,
}: MessagePlanCascadePreviewProps) {
  return (
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

          const accessibleTemplates = getAccessibleTemplatesForCascadeItem(
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
                        href={getLetterTemplatePreviewHref(defaultTemplate)}
                      >
                        {defaultTemplate.name}
                      </Link>
                    </p>
                  ) : (
                    <>
                      <p data-testid='template-name'>{defaultTemplate.name}</p>
                      <ControlledDetails className='nhsuk-u-margin-bottom-0'>
                        <DetailsSummary data-testid='preview-template-summary'>
                          {pageContent.previewTemplateSummary.prefix}{' '}
                          <span className='nhsuk-u-visually-hidden'>
                            {channelDisplayName}
                          </span>{' '}
                          {pageContent.previewTemplateSummary.suffix}
                        </DetailsSummary>
                        <DetailsText data-testid='preview-template-text'>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: renderTemplateMarkdown(defaultTemplate),
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
                    {accessibleTemplates.map(([accessibleFormat, template]) => (
                      <MessagePlanConditionalTemplatesListItem
                        key={template.id}
                        data-testid={`conditional-template-${accessibleFormat}`}
                      >
                        <MessagePlanChannelCard
                          heading={interpolate(
                            pageContent.accessibleFormatCardHeading,
                            {
                              format:
                                accessibleFormatDisplayMappings(
                                  accessibleFormat
                                ),
                            }
                          )}
                          data-testid='channel-card'
                        >
                          <p>
                            <Link href={getLetterTemplatePreviewHref(template)}>
                              {template.name}
                            </Link>
                          </p>
                        </MessagePlanChannelCard>
                      </MessagePlanConditionalTemplatesListItem>
                    ))}

                    {languageTemplates.length > 0 && (
                      <MessagePlanConditionalTemplatesListItem data-testid='conditional-template-languages'>
                        <MessagePlanChannelCard
                          heading={pageContent.languageFormatsCardHeading}
                          data-testid='channel-card'
                        >
                          {languageTemplates.map((template) => (
                            <p
                              key={template.id}
                              className='nhsuk-u-margin-bottom-0'
                            >
                              <Link
                                href={getLetterTemplatePreviewHref(template)}
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
  );
}
