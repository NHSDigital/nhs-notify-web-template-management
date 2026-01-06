'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { SummaryList, Tag } from 'nhsuk-react-components';
import { RoutingConfig } from 'nhs-notify-backend-client';
import { MessagePlanChannelList } from '@organisms/MessagePlanChannelList/MessagePlanChannelList';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import {
  messagePlanStatusToDisplayText,
  messagePlanStatusToTagColour,
  ORDINALS,
  ErrorState,
} from 'nhs-notify-web-template-management-utils';
import {
  MessagePlanTemplates,
  getChannelsMissingTemplates,
} from '@utils/routing-utils';
import { interpolate } from '@utils/interpolate';

import copy from '@content/content';
const { createEditMessagePlan: content } = copy.components;

export function CreateEditMessagePlan({
  messagePlan,
  templates,
}: {
  messagePlan: RoutingConfig;
  templates: MessagePlanTemplates;
}) {
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  const handleMoveToProduction = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const channelsWithoutTemplates = getChannelsMissingTemplates(messagePlan);

    if (channelsWithoutTemplates.length > 0) {
      event.preventDefault();

      const errors: Record<string, string[]> = {};

      for (const index of channelsWithoutTemplates) {
        const ordinal = ORDINALS[index]?.toLowerCase();
        const channelIdentifier = messagePlan.cascade[index].channel;

        errors[`channel-${channelIdentifier}`] = [
          interpolate(content.validationError.linkText, { ordinal }),
        ];
      }

      setErrorState({
        fieldErrors: errors,
      });
    }
  };

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-three-quarters'>
          {errorState && (
            <NhsNotifyErrorSummary
              hint={content.validationError.hintText}
              errorState={errorState}
            />
          )}
          <span className='nhsuk-caption-l'>{content.headerCaption}</span>
          <h1 className='nhsuk-heading-l'>{messagePlan.name}</h1>
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
            <SummaryList.Row>
              <SummaryList.Key>
                {content.rowHeadings.routingPlanId}
              </SummaryList.Key>
              <SummaryList.Value
                data-testid='routing-config-id'
                className='monospace-font'
              >
                {messagePlan.id}
              </SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>
                {content.rowHeadings.campaignId}
              </SummaryList.Key>
              <SummaryList.Value
                data-testid='campaign-id'
                className='monospace-font'
              >
                {messagePlan.campaignId}
              </SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>{content.rowHeadings.status}</SummaryList.Key>
              <SummaryList.Value>
                <Tag color={messagePlanStatusToTagColour(messagePlan.status)}>
                  {messagePlanStatusToDisplayText(messagePlan.status)}
                </Tag>
              </SummaryList.Value>
            </SummaryList.Row>
          </SummaryList>

          <MessagePlanChannelList
            messagePlan={messagePlan}
            templates={templates}
          />

          <div className='nhsuk-form-group' data-testid='message-plan-actions'>
            <Link
              href={interpolate(content.ctas.primary.href, {
                routingConfigId: messagePlan.id,
              })}
              passHref
              legacyBehavior
            >
              <NHSNotifyButton
                data-testid='move-to-production-cta'
                onClick={handleMoveToProduction}
              >
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
