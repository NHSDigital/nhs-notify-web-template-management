import { mockDeep } from 'jest-mock-extended';
import { SendRawEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { handler } from '../../../functions/send-email/handler';
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

  const messageId = rawMimeMessage?.match(/Message-ID: <([a-zA-z0-9]+)@undefined>/)?.[1];
  const messageBoundary = rawMimeMessage?.match(/boundary=([a-zA-z0-9]+)/)?.[1];

  const expectedMessage = `Date: Sat, 01 Jan 2022 10:00:00 +0000
From: =?utf-8?B?TkhTIE5vdGlmeQ==?= <no-reply@undefined>
To: <recipient-email>
Message-ID: <${messageId}@undefined>
Subject: =?utf-8?B?VGVtcGxhdGUgY3JlYXRlZCAtIHRlbXBsYXRlLW5hbWU=?=
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=${messageBoundary}

--${messageBoundary}
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit

Template has been successfully created. The template name is template-name and the template ID is template-id. The template content is attached.

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

    expect(handler(
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
    )).rejects.toThrow('Error sending email');
});
