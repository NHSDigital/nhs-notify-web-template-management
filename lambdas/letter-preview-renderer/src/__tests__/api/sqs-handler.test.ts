import { mock } from 'jest-mock-extended';
import type { Callback, Context } from 'aws-lambda';
import { makeSQSRecord } from 'nhs-notify-web-template-management-test-helper-utils';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { createHandler } from '../../api/sqs-handler';
import type { App } from '../../app/app';

function setup() {
  const app = mock<App>();
  const { logger, logMessages } = createMockLogger();

  const handler = createHandler({ app, logger });

  return { handler, mocks: { app }, logMessages };
}

const initialRequest = {
  requestType: 'initial',
  clientId: 'test-client',
  templateId: 'test-template',
  currentVersion: 'test-version',
};

const personalisedRequest = {
  requestType: 'personalised',
  requestTypeVariant: 'short',
  clientId: 'test-client',
  templateId: 'test-template',
  currentVersion: 'test-version',
  personalisation: { first_name: 'Test' },
  lockNumber: 1,
};

describe('createHandler', () => {
  test('parses request and calls app.renderInitial for initial request', async () => {
    const { handler, mocks } = setup();

    mocks.app.renderInitial.mockResolvedValue('rendered');

    const record = makeSQSRecord({
      body: JSON.stringify(initialRequest),
    });

    await handler({ Records: [record] }, mock<Context>(), mock<Callback>());

    expect(mocks.app.renderInitial).toHaveBeenCalledWith(initialRequest);
  });

  test('returns early without calling app for personalised-short', async () => {
    const { handler, mocks } = setup();

    const record = makeSQSRecord({
      body: JSON.stringify(personalisedRequest),
    });

    await handler({ Records: [record] }, mock<Context>(), mock<Callback>());

    expect(mocks.app.renderInitial).not.toHaveBeenCalled();
  });

  test('throws when event is not a valid render request', async () => {
    const { handler } = setup();

    await expect(
      handler(
        { Records: [makeSQSRecord({ body: JSON.stringify({}) })] },
        mock<Context>(),
        mock<Callback>()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('throws when event contains zero records', async () => {
    const { handler } = setup();

    await expect(
      handler({ Records: [] }, mock<Context>(), mock<Callback>())
    ).rejects.toThrow('Event contained unexpected number of events');
  });

  test('throws when event contains multiple records', async () => {
    const { handler } = setup();

    const record1 = makeSQSRecord({
      body: JSON.stringify(initialRequest),
    });
    const record2 = makeSQSRecord({
      body: JSON.stringify(initialRequest),
    });

    await expect(
      handler(
        { Records: [record1, record2] },
        mock<Context>(),
        mock<Callback>()
      )
    ).rejects.toThrow('Event contained unexpected number of events');
  });
});
