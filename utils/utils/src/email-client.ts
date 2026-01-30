/* eslint-disable security/detect-non-literal-fs-filename */
import { createMimeMessage } from 'mimetext';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { TemplateDto } from 'nhs-notify-backend-client';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export class EmailClient {
  constructor(
    private readonly sesClient: SESClient,
    private readonly senderEmail: string,
    private readonly recipientEmails: Record<string, string[]>,
    private readonly logger: Logger
  ) {}

  private getProofRequestedEmailContent(
    supplierReference: string,
    templateName: string,
    supplier: string
  ) {
    const emailTemplateContent = readFileSync(
      path.resolve(__dirname, './email-templates/proof-requested-email.html')
    ).toString();
    const htmlTemplate = Handlebars.compile(emailTemplateContent);

    const subject = `${supplier} - Letter template sent by an NHS Notify user`;
    const emailContent = htmlTemplate({
      supplier,
      templateId: supplierReference,
      templateName,
    });

    return {
      subject,
      emailContent,
    };
  }

  private getTemplateSubmittedEmailContent(
    supplierReference: string,
    template: LetterTemplate,
    supplier: string,
    proofFilenames: string[]
  ) {
    const emailTemplateContent = readFileSync(
      path.resolve(__dirname, './email-templates/template-submitted-email.html')
    ).toString();
    const htmlTemplate = Handlebars.compile(emailTemplateContent);

    const subject = `${supplier} - Letter proof approved by an NHS Notify user`;
    const emailContent = htmlTemplate({
      proofFilenames,
      supplier,
      timestamp: template.updatedAt,
      templateId: supplierReference,
      templateName: template.name,
    });

    return {
      subject,
      emailContent,
    };
  }

  private async sendEmailToSupplier(
    templateId: string,
    supplierReference: string,
    supplier: string,
    subject: string,
    emailContent: string
  ) {
    const recipientEmailsForSupplier = this.recipientEmails[supplier];

    if ((recipientEmailsForSupplier?.length ?? 0) === 0) {
      this.logger.info({
        description:
          'Not sending email to supplier because no recipients are configured',
        supplierReference,
        templateId,
        supplier,
      });

      return;
    }

    return Promise.all(
      recipientEmailsForSupplier.map(async (recipientEmail) => {
        const msg = createMimeMessage();

        msg.setSender({ name: 'NHS Notify', addr: this.senderEmail });

        msg.setRecipient(recipientEmail);
        msg.setSubject(subject);

        msg.addMessage({
          contentType: 'text/html',
          data: emailContent,
        });

        const command = new SendRawEmailCommand({
          RawMessage: {
            Data: Buffer.from(msg.asRaw()),
          },
        });

        const res = await this.sesClient.send(command);
        this.logger.info(res);
      })
    );
  }

  async sendProofRequestedEmailToSupplier(
    templateId: string,
    supplierReference: string,
    templateName: string,
    supplier: string
  ) {
    // cannot send if no email address provided
    if (!this.senderEmail) {
      this.logger.info({
        description:
          'Not sending proof requested email to suppliers because no email address is provided',
        supplierReference,
        templateId,
        templateName,
        supplier,
      });

      return;
    }

    const { subject, emailContent } = this.getProofRequestedEmailContent(
      supplierReference,
      templateName,
      supplier
    );

    await this.sendEmailToSupplier(
      templateId,
      supplierReference,
      supplier,
      subject,
      emailContent
    );
  }

  private async sendTemplateSubmittedEmailToSupplier(
    template: LetterTemplate,
    supplier: string,
    proofFilenames: string[]
  ) {
    const supplierReference = this.getSupplierReference(template);

    const { subject, emailContent } = this.getTemplateSubmittedEmailContent(
      supplierReference,
      template,
      supplier,
      proofFilenames
    );

    await this.sendEmailToSupplier(
      template.id,
      supplierReference,
      supplier,
      subject,
      emailContent
    );
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

    // nothing to send if template is not a PDF letter
    if (
      template.templateType !== 'LETTER' ||
      template.letterVersion !== 'PDF'
    ) {
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

  private getSupplierReference({
    clientId,
    campaignId,
    id,
    language,
    letterType,
  }: LetterTemplate) {
    return [clientId, campaignId, id, language, letterType].join('_');
  }
}
