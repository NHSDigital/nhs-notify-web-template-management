import { mockDeep } from 'jest-mock-extended';
import { SendRawEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { handler, emailTemplate } from '../../../functions/send-email';
import type { Schema } from '../../../data/resource';

jest.mock('@aws-sdk/client-ses', () => ({
  ...jest.requireActual('@aws-sdk/client-ses'),
  SESClient: jest.fn(),
}));
jest.mock('../../../../src/utils/logger');

type HandlerEventType = Parameters<Schema['sendEmail']['functionHandler']>[0];
type HandlerContextType = Parameters<Schema['sendEmail']['functionHandler']>[1];
type HandlerCallbackType = Parameters<
  Schema['sendEmail']['functionHandler']
>[2];

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 10:00'));
  process.env.NOTIFY_DOMAIN_NAME = 'test.notify.nhs.uk'
});

test('sends email', async () => {
  const mockSESClient = mockDeep<SESClient>({
    send: jest.fn().mockReturnValue({
      MessageId: 'message-id',
    }),
  });

  jest.mocked(SESClient).mockImplementation(() => mockSESClient);

  const response = await handler(
    mockDeep<HandlerEventType>({
      arguments: {
        recipientEmail: 'recipient-email',
        templateId: 'template-id',
        templateName: 'template-name',
        templateMessage: 'template-message',
      },
    }),
    mockDeep<HandlerContextType>(),
    mockDeep<HandlerCallbackType>()
  );

  expect(response).toEqual('message-id');

  const sesCallInput = mockSESClient.send.mock.calls[0][0]
    .input as SendRawEmailCommandInput;

  const rawMimeMessage = sesCallInput.RawMessage?.Data?.toString();

  const messageId = rawMimeMessage?.match(/Message-ID: <([^@]+)@/)?.[1];

  const messageBoundary = rawMimeMessage?.match(/boundary=([\dA-z]+)/)?.[1];

  const expectedMessage = `Date: Sat, 01 Jan 2022 10:00:00 +0000
From: =?utf-8?B?TkhTIE5vdGlmeQ==?= <no-reply@test.notify.nhs.uk>
To: <recipient-email>
Message-ID: <${messageId}@test.notify.nhs.uk>
Subject: =?utf-8?B?VGVtcGxhdGUgc3VibWl0dGVkIC0gdGVtcGxhdGUtbmFtZQ==?=
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=${messageBoundary}

--${messageBoundary}
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

${emailTemplate('template-id', 'template-name', 'template-message')}

--${messageBoundary}
Content-Type: text/markdown; name="template-content.md"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="template-content.md"

dGVtcGxhdGUtbWVzc2FnZQ==
--${messageBoundary}--`;

  expect(rawMimeMessage?.toString()).toEqual(expectedMessage);
});

test('sends email with error', async () => {
  const mockSESClient = mockDeep<SESClient>({
    send: jest.fn().mockReturnValue({}),
  });

  jest.mocked(SESClient).mockImplementation(() => mockSESClient);

  await expect(
    handler(
      mockDeep<HandlerEventType>({
        arguments: {
          recipientEmail: 'recipient-email',
          templateId: 'template-id',
          templateName: 'template-name',
          templateMessage: 'template-message',
        },
      }),
      mockDeep<HandlerContextType>(),
      mockDeep<HandlerCallbackType>()
    )
  ).rejects.toThrow('Error sending email');
});
