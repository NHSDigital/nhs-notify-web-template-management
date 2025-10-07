import { Fragment } from 'react';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';
import { RoutingConfig } from 'nhs-notify-backend-client';

import styles from '@organisms/MessagePlanChannelList/MessagePlanChannelList.module.scss';

export function MessagePlanChannelList({
  messagePlan,
}: {
  messagePlan: RoutingConfig;
}) {
  return (
    <ul className={styles['channel-list']}>
      {messagePlan.cascade.map((messagePlanChannel, index) => (
        <Fragment key={`channel-${index + 1}`}>
          <MessagePlanBlock index={index} channelItem={messagePlanChannel} />
          <MessagePlanFallbackConditions channel={messagePlanChannel.channel} />
        </Fragment>
      ))}
    </ul>
  );
}
