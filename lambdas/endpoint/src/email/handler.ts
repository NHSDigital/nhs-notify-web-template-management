import { createMimeMessage } from 'mimetext';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from '../logger';
import { emailTemplate } from './email-template';

const config = () => ({
  senderEmail: `no-reply@${process.env.NOTIFY_DOMAIN_NAME}`,
});

const getTemplateId = (event: APIGatewayProxyEvent): string => {
  if (!event.body) {
    throw new Error('Missing event body');
  }

  const eventBodyJson = JSON.parse(event.body);

  if (!eventBodyJson.templateId) {
    throw new Error('Missing template ID');
  }

  return eventBodyJson.templateId;
};

const getOwner = async (
  event: APIGatewayProxyEvent
): Promise<{
  username: string;
  emailAddress: string;
}> => {
  const accessToken = event.headers.Authorization;

  if (!accessToken) {
    throw new Error('Missing access token');
  }

  const client = new CognitoIdentityProviderClient({ region: 'eu-west-2' });

  const { Username, UserAttributes } = await client.send(
    new GetUserCommand({
      AccessToken: accessToken,
    })
  );

  if (!Username || !UserAttributes) {
    throw new Error('Missing user');
  }

  const emailAddress = UserAttributes.find(
    ({ Name }) => Name === 'email'
  )?.Value;

  if (!emailAddress) {
    throw new Error('Missing user email address');
  }

  return {
    username: Username,
    emailAddress,
  };
};

const getTemplate = async (owner: string, templateId: string) => {
  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  const { Item } = await client.send(
    new GetCommand({
      TableName: process.env.TEMPLATES_TABLE_NAME ?? '',
      Key: {
        owner,
        templateId,
      },
    })
  );

  if (!Item) {
    throw new Error('Cound not find template');
  }

  return Item;
};

export const emailHandler: APIGatewayProxyHandler = async (event) => {
  const client = new SESClient({ region: 'eu-west-2' });

  const templateId = getTemplateId(event);
  const { username, emailAddress } = await getOwner(event);

  const { name, message, subject } = await getTemplate(username, templateId);

  const { senderEmail } = config();

  logger.info(`Sending email for template ${name} with ID ${templateId}`);

  const msg = createMimeMessage();
  msg.setSender({ name: 'NHS Notify', addr: senderEmail });
  msg.setTo([{ addr: emailAddress }]);
  msg.setSubject(`Template submitted - ${name}`);
  msg.addMessage({
    contentType: 'text/html',
    data: emailTemplate(templateId, name, message, subject),
  });

  const command = new SendRawEmailCommand({
    RawMessage: {
      Data: Buffer.from(msg.asRaw()),
    },
  });

  const res = await client.send(command);

  if (!res.MessageId) {
    logger.error(res);
    throw new Error('Error sending email');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
};
