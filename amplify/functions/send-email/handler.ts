import { createMimeMessage } from 'mimetext';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { logger } from '../../../src/utils/logger';
import type { Schema } from '../../data/resource';

const config = () => ({
  senderEmail: `no-reply@${process.env.NOTIFY_DOMAIN_NAME}`,
});

export const handler: Schema['sendEmail']['functionHandler'] = async (
  event
) => {
  const client = new SESClient({ region: 'eu-west-2' });

  const { senderEmail } = config();
  const { recipientEmail, templateId, templateName, templateMessage } =
    event.arguments;

  logger.info(
    `Sending email for template ${templateName} with ID ${templateId}`
  );

  const msg = createMimeMessage();
  msg.setSender({ name: 'NHS Notify', addr: senderEmail });
  msg.setTo([{ addr: recipientEmail }]);
  msg.setSubject(`Template created - ${templateName}`);
  msg.addMessage({
    contentType: 'text/plain',
    data: `Template has been successfully created. The template name is ${templateName} and the template ID is ${templateId}. The template content is attached.`,
  });
  msg.addAttachment({
    filename: 'template-content.md',
    contentType: 'text/markdown',
    data: Buffer.from(templateMessage).toString('base64'),
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

  return res.MessageId;
};
