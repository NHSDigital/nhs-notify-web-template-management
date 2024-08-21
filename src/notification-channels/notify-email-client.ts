import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({
  region: 'eu-west-2',
});

export const SendEmail = async () => {
  const input = {
    Destination: {
      BccAddresses: [],
      CcAddresses: [],
      ToAddresses: ['muhammed.salaudeen1@nhs.net'],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'utf8',
          Data: 'This message body contains HTML formatting. It can, for example, contain links like this one: <a class="ulink" href="http://docs.aws.amazon.com/ses/latest/DeveloperGuide" target="_blank">Amazon SES Developer Guide</a>.',
        },
        Text: {
          Charset: 'utf8',
          Data: 'This is the message body in text format.',
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
  console.log('I got here');
  return client.send(command);
};

/** response ==
{
  "MessageId": "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
}
*/
// example id: sendemail-1469049656296
