import { Fragment } from 'react';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';
import { RoutingConfig, TemplateDto } from 'nhs-notify-backend-client';
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
    templateId?: string
  ): TemplateDto | undefined {
    if (!templateId) return;
    return templates[templateId];
  }

  return (
    <ul className={styles['channel-list']}>
      {messagePlan.cascade.map((messagePlanChannel, index) => (
        <Fragment key={`channel-${index + 1}`}>
          <MessagePlanBlock
            index={index}
            channelItem={messagePlanChannel}
            template={getMessagePlanTemplateById(
              messagePlanChannel.defaultTemplateId
            )}
          />
          <MessagePlanFallbackConditions channel={messagePlanChannel.channel} />
        </Fragment>
      ))}
    </ul>
  );
}
