import { createMimeMessage } from 'mimetext';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from '../logger';
import { emailTemplate } from './email-template';
import { ErrorWithStatusCode } from '../error-with-status-code';
import { getTemplate } from './get-template';
import { getTemplateId } from './get-template-id';

const config = () => {
  const senderEmail = process.env.SENDER_EMAIL;
  const tableName = process.env.TEMPLATES_TABLE_NAME;

  if (!senderEmail || !tableName) {
    logger.error({
      description: 'Lambda misconfiguration',
      senderEmail,
      tableName,
    });
    throw new ErrorWithStatusCode('Internal server error', 500);
  }

  return {
    senderEmail,
    tableName,
  };
};

export const emailHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const { senderEmail, tableName } = config();

    const templateId = getTemplateId(event);

    const { user, email } = event.requestContext?.authorizer || {};

    if (!user || !email) {
      throw new ErrorWithStatusCode(
        'Missing username or email from authorization context',
        403
      );
    }

    const { name, message, subject } = await getTemplate(
      tableName,
      user,
      templateId
    );

    logger.info(`Sending email for template ${name} with ID ${templateId}`);

    const msg = createMimeMessage();
    msg.setSender({ name: 'NHS Notify', addr: senderEmail });
    msg.setTo([{ addr: email }]);
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

    const res = await new SESClient({ region: 'eu-west-2' }).send(command);
    logger.info(res);

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (error) {
    logger.error('Failed to send email', { error });

    if (error instanceof ResourceNotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          technicalMessage: 'Invalid template ID',
        }),
      };
    }

    if (error instanceof ErrorWithStatusCode) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          technicalMessage: error.message,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        technicalMessage: 'Internal server error',
      }),
    };
  }
};
