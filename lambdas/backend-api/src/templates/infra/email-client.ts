import { createMimeMessage, MailboxAddrObject } from 'mimetext';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { TemplateDto } from 'nhs-notify-backend-client';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';

export class EmailClient {
  constructor(
    private readonly sesClient: SESClient,
    private readonly senderEmail: string,
    private readonly recipientEmails: Record<string, string[]>,
    private readonly logger: Logger
  ) {}

  private getTemplateSubmittedEmailContent(
    { updatedAt, id, name }: LetterTemplate,
    supplier: string,
    proofFilenames: string[]
  ) {
    const emailTemplateContent = readFileSync(
      './email-template.html'
    ).toString();
    const htmlTemplate = Handlebars.compile(emailTemplateContent);

    return htmlTemplate({
      proofFilenames,
      supplier,
      timestamp: updatedAt,
      templateId: id,
      templateName: name,
    });
  }

  private async sendTemplateSubmittedEmailToSupplier(
    template: LetterTemplate,
    supplier: string,
    proofFilenames: string[]
  ) {
    const recipientEmailsForSupplier = this.recipientEmails[supplier];

    if ((recipientEmailsForSupplier?.length ?? 0) === 0) {
      this.logger.info({
        description:
          'Not sending template submitted email to supplier because no recipients are configured',
        templateId: template.id,
        supplier,
      });

      return;
    }

    const msg = createMimeMessage();
    msg.setSender({ name: 'NHS Notify', addr: this.senderEmail });

    const recipients: MailboxAddrObject[] = recipientEmailsForSupplier.map(
      (emailAddress) => ({ addr: emailAddress, type: 'Bcc' })
    );
    msg.setTo(recipients, { type: 'Bcc' });
    msg.setSubject(`${supplier} - Letter proof approved by an NHS Notify user`);
    msg.addMessage({
      contentType: 'text/html',
      data: this.getTemplateSubmittedEmailContent(
        template,
        supplier,
        proofFilenames
      ),
    });

    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(msg.asRaw()),
      },
    });

    const res = await this.sesClient.send(command);
    this.logger.info(res);
  }

  async sendTemplateSubmittedEmailToSuppliers(template: TemplateDto) {
    // cannot send if no email address provided
    if (!this.senderEmail) {
      this.logger.info({
        description:
          'Not sending template submitted email to suppliers because no email address is provided',
        templateId: template.id,
      });

      return;
    }

    // nothing to send if template is not a letter
    if (template.templateType !== 'LETTER') {
      this.logger.info({
        description:
          'Not sending template submitted email to suppliers because templateType is not LETTER',
        templateId: template.id,
      });

      return;
    }

    const proofsBySupplier: Record<string, string[]> = {};

    for (const { supplier, fileName } of Object.values(
      template.files.proofs ?? {}
    )) {
      const proofFilenames = [...(proofsBySupplier[supplier] ?? []), fileName];
      proofsBySupplier[supplier] = proofFilenames;
    }

    for (const [supplier, proofFilenames] of Object.entries(proofsBySupplier)) {
      await this.sendTemplateSubmittedEmailToSupplier(
        template,
        supplier,
        proofFilenames
      );
    }
  }
}
