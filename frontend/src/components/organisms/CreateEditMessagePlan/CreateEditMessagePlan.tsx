'use client';

import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { SummaryList, Tag } from 'nhsuk-react-components';
import { RoutingConfig } from 'nhs-notify-backend-client';
import { MessagePlanChannelList } from '@organisms/MessagePlanChannelList/MessagePlanChannelList';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import {
  messagePlanStatusToDisplayText,
  messagePlanStatusToTagColour,
} from 'nhs-notify-web-template-management-utils';
import { MessagePlanTemplates } from '@utils/routing-utils';

import styles from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan.module.scss';

import copy from '@content/content';
import { interpolate } from '@utils/interpolate';
const { createEditMessagePlan: content } = copy.components;

export function CreateEditMessagePlan({
  messagePlan,
  templates,
}: {
  messagePlan: RoutingConfig;
  templates: MessagePlanTemplates;
}) {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-three-quarters'>
          {/* TODO: CCM-11495 Add ErrorSummary component */}
          <span className='nhsuk-caption-l'>{content.headerCaption}</span>
          <h1 className='nhsuk-heading-l'>{messagePlan.name}</h1>
          <p className='nhsuk-body-s'>
            <Link
              data-testid='change-message-plan-name-link'
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
                className={styles['create-edit-message-plan-routing-config-id']}
              >
                {messagePlan.id}
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
            {/* TODO: CCM-11495 Add validation */}
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
