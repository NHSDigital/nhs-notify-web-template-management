import {
  CascadeItem,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-backend-client';
import { interpolate } from '@utils/interpolate';
import { ORDINALS } from 'nhs-notify-web-template-management-utils';
import { MessagePlanChannelTemplate } from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate';
import { MessagePlanConditionalLetterTemplates } from '@molecules/MessagePlanConditionalTemplates/MessagePlanConditionalTemplates';
import { MessagePlanTemplates } from '@utils/routing-utils';

import styles from '@molecules/MessagePlanBlock/MessagePlanBlock.module.scss';

import copy from '@content/content';
const { messagePlanBlock: content } = copy.components;

export function MessagePlanBlock({
  index,
  channelItem,
  defaultTemplate,
  routingConfigId,
  conditionalTemplates,
}: {
  index: number;
  channelItem: CascadeItem;
  defaultTemplate?: TemplateDto;
  routingConfigId: RoutingConfig['id'];
  conditionalTemplates: MessagePlanTemplates;
}) {
  return (
    <li
      className={styles['message-plan-block']}
      data-testid={`message-plan-block-${channelItem.channel}`}
    >
      <div className={styles['message-plan-block-number']} aria-hidden='true'>
        {index + 1}
      </div>
      <h2 className='nhsuk-heading-m nhsuk-u-padding-top-1'>
        {interpolate(content.title, { ordinal: ORDINALS[index] })}
      </h2>

      <MessagePlanChannelTemplate
        channel={channelItem.channel}
        template={defaultTemplate}
        required={true}
        routingConfigId={routingConfigId}
      />

      <MessagePlanConditionalLetterTemplates
        cascadeItem={channelItem}
        cascadeIndex={index}
        routingConfigId={routingConfigId}
        conditionalTemplates={conditionalTemplates}
      />
    </li>
  );
}
