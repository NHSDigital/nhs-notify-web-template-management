import { mock } from 'jest-mock-extended';
import type { Callback, Context } from 'aws-lambda';
import { makeSQSRecord } from 'nhs-notify-web-template-management-test-helper-utils';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { createHandler } from '../../api/sqs-handler';
import type { App } from '../../app/app';
import {
  createInitialRequest,
  createPersonalisedRequest,
} from '../fixtures/create-request';

function setup() {
  const app = mock<App>();
  const { logger, logMessages } = createMockLogger();

  const handler = createHandler({ app, logger });

  return { handler, mocks: { app }, logMessages };
}

describe('createHandler', () => {
  test('parses request and calls app.renderInitial for initial request', async () => {
    const { handler, mocks } = setup();

    const request = createInitialRequest();

    mocks.app.renderInitial.mockResolvedValue('rendered');

    const record = makeSQSRecord({
      body: JSON.stringify(request),
    });

    await handler({ Records: [record] }, mock<Context>(), mock<Callback>());

    expect(mocks.app.renderInitial).toHaveBeenCalledWith(request);
    expect(mocks.app.renderPersonalised).not.toHaveBeenCalled();
  });

  test('parses request and calls app.renderPersonalised for personalised request', async () => {
    const { handler, mocks } = setup();

    const request = createPersonalisedRequest();

    mocks.app.renderPersonalised.mockResolvedValue('rendered');

    const record = makeSQSRecord({
      body: JSON.stringify(request),
    });

    await handler({ Records: [record] }, mock<Context>(), mock<Callback>());

    expect(mocks.app.renderPersonalised).toHaveBeenCalledWith(request);
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

    const request = createInitialRequest();

    const record1 = makeSQSRecord({
      body: JSON.stringify(request),
    });
    const record2 = makeSQSRecord({
      body: JSON.stringify(request),
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
