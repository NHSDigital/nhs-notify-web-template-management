import { test as base } from '@playwright/test';
import { env, ACCOUNT_NAME } from '@comms/playwright-utils';
import { EventSubscriber } from '../../../../helpers/event-subscriber';
import { OUTGOING_EVENTS_TOPIC_ARN } from '../../../../constants';

type LetterPreparedSubscriber = {
  letterPreparedSubscriber: EventSubscriber;
};

export const testWithLetterPreparedSubscriber = base.extend<
  object,
  LetterPreparedSubscriber
>({
  letterPreparedSubscriber: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const subscriber = new EventSubscriber(
        OUTGOING_EVENTS_TOPIC_ARN,
        process.env.ACCOUNT_ID,
        env,
        'letters',
        'letter-prepared',
        `/data-plane/letter-rendering/${ACCOUNT_NAME}/${env}`,
        workerInfo.workerIndex
      );

      await subscriber.initialise();

      await use(subscriber).finally(() => subscriber.teardown());
    },
    { scope: 'worker' },
  ],
});

export const { expect } = testWithLetterPreparedSubscriber;
