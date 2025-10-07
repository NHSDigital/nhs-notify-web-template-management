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
      {messagePlan.cascade.map((messagePlanChannel, i) => (
        <Fragment key={`channel-${i + 1}`}>
          <MessagePlanBlock index={i} channelItem={messagePlanChannel} />
          <MessagePlanFallbackConditions channel={messagePlanChannel.channel} />
        </Fragment>
      ))}
    </ul>
  );
}
