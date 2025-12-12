import { mockDeep } from 'jest-mock-extended';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { EmailClient } from '../email-client';
import { TemplateDto } from 'nhs-notify-backend-client';
import { LetterTemplate } from '../types';

describe('EmailClient', () => {
  const recipientEmails = {
    supplier1: ['supplier1@nhs.net'],
    supplier2: ['supplier2@nhs.net', 'also-supplier2@nhs.net'],
  };

  const sesClient = mockDeep<SESClient>();
  const logger = mockDeep<Logger>();

  describe('proof-requested email', () => {
    it('does not send email when no sender email address provided', async () => {
      const client = new EmailClient(sesClient, '', recipientEmails, logger);

      const templateId = 'template-id';
      const supplierReference = 'client_campaign_template-id_en_x0';

      await client.sendProofRequestedEmailToSupplier(
        templateId,
        supplierReference,
        'template-name',
        'supplier1'
      );

      expect(sesClient.send).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith({
        description:
          'Not sending proof requested email to suppliers because no email address is provided',
        supplierReference,
        templateId,
        templateName: 'template-name',
        supplier: 'supplier1',
      });
    });

    it('sends email', async () => {
      const client = new EmailClient(
        sesClient,
        'test@nhs.net',
        recipientEmails,
        logger
      );

      const templateId = 'template-id';
      const supplierReference = 'client_campaign_template-id_en_x0';

      await client.sendProofRequestedEmailToSupplier(
        templateId,
        supplierReference,
        'template-name',
        'supplier1'
      );
      expect(sesClient.send).toHaveBeenCalledWith(
        expect.any(SendRawEmailCommand)
      );

      const sesInput = sesClient.send.mock.calls[0][0];
      if (!(sesInput instanceof SendRawEmailCommand)) {
        throw new TypeError('Unexpected command given to SES client');
      }

      const emailContent = sesInput.input.RawMessage?.Data?.toString();
      expect(emailContent).toContain(supplierReference);
      expect(emailContent).toContain('template-name');
      expect(emailContent).toContain('supplier1');
    });
  });

  describe('template-submitted email', () => {
    const mockTemplate = mockDeep<LetterTemplate>({
      id: 'template-id',
      templateType: 'LETTER',
      files: {
        proofs: {
          proof1: { fileName: 'proof1.pdf', supplier: 'supplier1' },
          proof2: { fileName: 'proof2.pdf', supplier: 'supplier2' },
          proof3: { fileName: 'proof3.pdf', supplier: 'supplier2' },
        },
      },
      updatedAt: '2022-01-01T00:00:00Z',
      name: 'template-name',
      clientId: 'the-client',
      campaignId: 'camp-id',
      language: 'de',
      letterType: 'q4',
    });

    const supplierReference = [
      mockTemplate.clientId,
      mockTemplate.campaignId,
      mockTemplate.id,
      mockTemplate.language,
      mockTemplate.letterType,
    ].join('_');

    const emailCanonicalizer = (emailContent: string) => {
      emailContent = emailContent.replace(/Date:.+\n/, 'Date: <DATE>\n');
      emailContent = emailContent.replace(
        /Message-ID:.+\n/,
        'Message-ID: <MESSAGE-ID>\n'
      );
      return emailContent;
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('does not send email when no sender email address provided', async () => {
      const client = new EmailClient(sesClient, '', recipientEmails, logger);

      await client.sendTemplateSubmittedEmailToSuppliers(mockTemplate);

      expect(sesClient.send).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith({
        description:
          'Not sending template submitted email to suppliers because no email address is provided',
        templateId: mockTemplate.id,
      });
    });

    it('does not send email if templateType is not LETTER', async () => {
      const client = new EmailClient(
        sesClient,
        'test@nhs.net',
        recipientEmails,
        logger
      );
      const template = mockDeep<TemplateDto>({
        ...mockTemplate,
        templateType: 'NHS_APP',
      });

      await client.sendTemplateSubmittedEmailToSuppliers(template);

      expect(sesClient.send).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith({
        description:
          'Not sending template submitted email to suppliers because templateType is not LETTER',
        templateId: mockTemplate.id,
      });
    });

    it('does not send email if no recipients are configured', async () => {
      const client = new EmailClient(
        sesClient,
        'test@nhs.net',
        {
          supplier2: [],
        },
        logger
      );

      await client.sendTemplateSubmittedEmailToSuppliers(mockTemplate);

      expect(sesClient.send).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith({
        description:
          'Not sending email to supplier because no recipients are configured',
        supplierReference,
        templateId: mockTemplate.id,
        supplier: 'supplier2',
      });
      expect(logger.info).toHaveBeenCalledWith({
        description:
          'Not sending email to supplier because no recipients are configured',
        supplierReference,
        templateId: mockTemplate.id,
        supplier: 'supplier1',
      });
    });

    it('sends no email if there are no proofs on the template', async () => {
      const client = new EmailClient(
        sesClient,
        'test@nhs.net',
        recipientEmails,
        logger
      );
      const template = mockDeep<TemplateDto>({
        id: 'template-id',
        templateType: 'LETTER',
        files: {
          proofs: undefined,
        },
        updatedAt: '2022-01-01T00:00:00Z',
        name: 'template-name',
      });

      await client.sendTemplateSubmittedEmailToSuppliers(template);

      expect(sesClient.send).not.toHaveBeenCalled();
    });

    it('sends email to multiple suppliers', async () => {
      const client = new EmailClient(
        sesClient,
        'test@nhs.net',
        recipientEmails,
        logger
      );

      await client.sendTemplateSubmittedEmailToSuppliers(mockTemplate);

      expect(sesClient.send).toHaveBeenCalledTimes(3);
      expect(sesClient.send).toHaveBeenCalledWith(
        expect.any(SendRawEmailCommand)
      );

      // check email to supplier1
      const sesCall1Input = sesClient.send.mock.calls[0][0];
      if (!(sesCall1Input instanceof SendRawEmailCommand)) {
        throw new TypeError('Unexpected command given to SES client');
      }

      const supplier1EmailContent =
        sesCall1Input.input.RawMessage?.Data?.toString() ?? '';

      expect(supplier1EmailContent).toContain(supplierReference);
      expect(supplier1EmailContent).toContain(recipientEmails.supplier1[0]);
      expect(supplier1EmailContent).toContain('template-name');
      expect(supplier1EmailContent).toContain('supplier1');
      expect(supplier1EmailContent).not.toContain('supplier2');
      expect(supplier1EmailContent).toContain('proof1.pdf');
      expect(supplier1EmailContent).not.toContain('proof2.pdf');
      expect(emailCanonicalizer(supplier1EmailContent)).toMatchSnapshot();

      // check emails to supplier2
      const sesCall2Input = sesClient.send.mock.calls[1][0];
      if (!(sesCall2Input instanceof SendRawEmailCommand)) {
        throw new TypeError('Unexpected command given to SES client');
      }

      const supplier2Recipient1EmailContent =
        sesCall2Input.input.RawMessage?.Data?.toString() ?? '';
      expect(supplier2Recipient1EmailContent).toContain(supplierReference);
      expect(supplier2Recipient1EmailContent).toContain(
        recipientEmails.supplier2[0]
      );
      expect(supplier2Recipient1EmailContent).toContain('template-name');
      expect(supplier2Recipient1EmailContent).not.toContain('supplier1');
      expect(supplier2Recipient1EmailContent).toContain('supplier2');
      expect(supplier2Recipient1EmailContent).not.toContain('proof1.pdf');
      expect(supplier2Recipient1EmailContent).toContain('proof2.pdf');
      expect(
        emailCanonicalizer(supplier2Recipient1EmailContent)
      ).toMatchSnapshot();

      const sesCall3Input = sesClient.send.mock.calls[2][0];
      if (!(sesCall3Input instanceof SendRawEmailCommand)) {
        throw new TypeError('Unexpected command given to SES client');
      }

      const supplier2Recipient2EmailContent =
        sesCall3Input.input.RawMessage?.Data?.toString() ?? '';
      expect(supplier2Recipient2EmailContent).toContain(supplierReference);
      expect(supplier2Recipient2EmailContent).toContain(
        recipientEmails.supplier2[1]
      );
      expect(supplier2Recipient2EmailContent).toContain('template-name');
      expect(supplier2Recipient2EmailContent).not.toContain('supplier1');
      expect(supplier2Recipient2EmailContent).toContain('supplier2');
      expect(supplier2Recipient2EmailContent).not.toContain('proof1.pdf');
      expect(supplier2Recipient2EmailContent).toContain('proof2.pdf');
      expect(
        emailCanonicalizer(supplier2Recipient2EmailContent)
      ).toMatchSnapshot();
    });
  });
});
