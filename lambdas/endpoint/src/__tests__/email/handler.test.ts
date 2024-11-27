/**
 * @jest-environment node
 */
import type { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import { mockDeep } from 'jest-mock-extended';
import { SendRawEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import { emailHandler } from '../../email/handler';
import { emailTemplate } from '../../email/email-template';
import { getTemplate } from '../../email/get-template';
import { ErrorWithStatusCode } from '../../error-with-status-code';

jest.mock('../../email/get-template-id', () => ({
  getTemplateId: () => 'template-id',
}));
jest.mock('../../email/get-template');
jest.mock('../../email/get-owner', () => ({
  getOwner: () => ({
    username: 'username',
    emailAddress: 'recipient-email',
  }),
}));

jest.mock('@aws-sdk/client-ses', () => ({
  ...jest.requireActual('@aws-sdk/client-ses'),
  SESClient: jest.fn(),
}));

describe('email handler', () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2022-01-01 10:00'));
  });

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.TEMPLATES_TABLE_NAME = 'table-name';
    process.env.SENDER_EMAIL = 'sender-email@test';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('malformed lambda configuration', async () => {
    process.env.SENDER_EMAIL = '';

    const res = await emailHandler(
      mockDeep<APIGatewayProxyEvent>({
        body: JSON.stringify({
          templateId: 'template-id',
        }),
        headers: {
          Authorization: 'auth-header',
        },
      }),
      mockDeep<Context>(),
      mockDeep<Callback>()
    );

    expect(res).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        technicalMessage: 'Internal server error',
      }),
    });
  });

  test('handles ResourceNotFoundException', async () => {
    jest.mocked(getTemplate).mockImplementation(() => {
      throw Object.create(ResourceNotFoundException.prototype);
    });

    const res = await emailHandler(
      mockDeep<APIGatewayProxyEvent>(),
      mockDeep<Context>(),
      mockDeep<Callback>()
    );

    expect(res).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        technicalMessage: 'Invalid template ID',
      }),
    });
  });

  test('handles ErrorWithStatusCode', async () => {
    jest.mocked(getTemplate).mockImplementation(() => {
      throw new ErrorWithStatusCode('custom error', 400);
    });

    const res = await emailHandler(
      mockDeep<APIGatewayProxyEvent>(),
      mockDeep<Context>(),
      mockDeep<Callback>()
    );

    expect(res).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        technicalMessage: 'custom error',
      }),
    });
  });

  test('handles generic error', async () => {
    jest.mocked(getTemplate).mockImplementation(() => {
      throw new Error('generic error');
    });

    const res = await emailHandler(
      mockDeep<APIGatewayProxyEvent>(),
      mockDeep<Context>(),
      mockDeep<Callback>()
    );

    expect(res).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        technicalMessage: 'Internal server error',
      }),
    });
  });

  test('valid email sent', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      name: 'name',
      message: 'message',
    });

    const mockSESClient = mockDeep<SESClient>({
      send: jest.fn().mockReturnValue({
        MessageId: 'message-id',
      }),
    });

    jest.mocked(SESClient).mockImplementation(() => mockSESClient);

    const res = await emailHandler(
      mockDeep<APIGatewayProxyEvent>({
        body: JSON.stringify({
          templateId: 'template-id',
        }),
        headers: {
          Authorization: 'auth-header',
        },
      }),
      mockDeep<Context>(),
      mockDeep<Callback>()
    );

    expect(res).toEqual({
      statusCode: 200,
      body: JSON.stringify({}),
    });

    const sesCallInput = mockSESClient.send.mock.calls[0][0]
      .input as SendRawEmailCommandInput;

    const rawMimeMessage = sesCallInput.RawMessage?.Data?.toString();

    const messageId = rawMimeMessage?.match(/Message-ID: <([^@]+)@/)?.[1];

    const expectedMessage = `Date: Sat, 01 Jan 2022 10:00:00 +0000
From: =?utf-8?B?TkhTIE5vdGlmeQ==?= <sender-email@test>
To: <recipient-email>
Message-ID: <${messageId}@test>
Subject: =?utf-8?B?VGVtcGxhdGUgc3VibWl0dGVkIC0gbmFtZQ==?=
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

${emailTemplate('template-id', 'name', 'message')}`;

    expect(rawMimeMessage?.toString()).toEqual(expectedMessage);
  });
});
