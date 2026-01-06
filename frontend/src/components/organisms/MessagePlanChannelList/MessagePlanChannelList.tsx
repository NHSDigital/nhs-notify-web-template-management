import { Fragment, PropsWithChildren } from 'react';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';
import { CascadeItem, RoutingConfig } from 'nhs-notify-backend-client';
import {
  getConditionalTemplatesForItem,
  getDefaultTemplateForItem,
  MessagePlanTemplates,
} from '@utils/routing-utils';

import styles from '@organisms/MessagePlanChannelList/MessagePlanChannelList.module.scss';

export function MessagePlanChannelList({
  messagePlan,
  templates,
}: {
  messagePlan: RoutingConfig;
  templates: MessagePlanTemplates;
}) {
  return (
    <ul className={styles['channel-list']}>
      {messagePlan.cascade.map(
        (messagePlanChannel: CascadeItem, index: number) => (
          <Fragment key={`channel-${index + 1}`}>
            <MessagePlanBlock
              index={index}
              channelItem={messagePlanChannel}
              defaultTemplate={getDefaultTemplateForItem(
                messagePlanChannel,
                templates
              )}
              routingConfigId={messagePlan.id}
              conditionalTemplates={getConditionalTemplatesForItem(
                messagePlanChannel,
                templates
              )}
              lockNumber={messagePlan.lockNumber}
            />
            {/* Show fallback conditions only if there is more than one channel, and not for the last channel */}
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

export function MessagePlanChannelListNew({ children }: PropsWithChildren) {
  return <ul className={styles['channel-list']}>{children}</ul>;
}
