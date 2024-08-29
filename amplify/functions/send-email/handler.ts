import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {  } from 'aws-cdk-lib/aws-ses';
import type { Schema } from '../../data/resource';

const client = new SESClient({ region: 'eu-west-2' });

export const handler: Schema['SendEmail']['functionHandler'] = async (
  event,
  context
) => {
  // export const handler: Handler = async (event, context) => {
  // your function code goes here
  const { message } = event.arguments;
  const input = {
    Destination: {
      BccAddresses: [],
      CcAddresses: [],
      ToAddresses: ['muhammed.salaudeen1@nhs.net'],
    },
    Message: {
      Body: {
        Text: {
          Data: message,
        },
      },
      Subject: {
        Charset: 'utf8',
        Data: 'Test email',
      },
    },
    ReplyToAddresses: [],
    ReturnPath: '',
    ReturnPathArn: '',
    Source: 'england.test.cm@nhs.net',
    SourceArn: '',
  };
  const command = new SendEmailCommand(input);
  const response = await client.send(command);
  return response.MessageId || 'Email Sent!';
  // const { message } = event.arguments;
  // return `Hello, ${message}!`;
};
