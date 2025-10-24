import { Fragment } from 'react';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';
import {
  CascadeItem,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-backend-client';
import { MessagePlanTemplates } from '@utils/message-plans';

import styles from '@organisms/MessagePlanChannelList/MessagePlanChannelList.module.scss';

export function MessagePlanChannelList({
  messagePlan,
  templates,
}: {
  messagePlan: RoutingConfig;
  templates: MessagePlanTemplates;
}) {
  function getMessagePlanTemplateById(
    templateId?: string | null
  ): TemplateDto | undefined {
    if (!templateId) return;
    return templates[templateId];
  }

  return (
    <ul className={styles['channel-list']}>
      {messagePlan.cascade.map(
        (messagePlanChannel: CascadeItem, index: number) => (
          <Fragment key={`channel-${index + 1}`}>
            <MessagePlanBlock
              index={index}
              channelItem={messagePlanChannel}
              template={getMessagePlanTemplateById(
                messagePlanChannel.defaultTemplateId
              )}
              routingConfigId={messagePlan.id}
            />
            {/* Show fallback conditions only if there is more than one channel, and not for the last channel */}
            {/* TODO: CCM-11494 Update this logic for letter formats */}
            {messagePlan.cascade.length > 1 &&
              index < messagePlan.cascade.length - 1 && (
                <MessagePlanFallbackConditions
                  channel={messagePlanChannel.channel}
                  index={index}
                />
              )}
          </Fragment>
        )
      )}
    </ul>
  );
}
