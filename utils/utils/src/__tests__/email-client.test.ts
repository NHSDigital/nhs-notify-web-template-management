import { mockDeep } from 'jest-mock-extended';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { EmailClient } from '../email-client';
import { TemplateDto } from 'nhs-notify-backend-client';

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

      await client.sendProofRequestedEmailToSupplier(
        'template-id',
        'template-name',
        'supplier1'
      );

      expect(sesClient.send).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith({
        description:
          'Not sending template submitted email to suppliers because no email address is provided',
        templateId: 'template-id',
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

      await client.sendProofRequestedEmailToSupplier(
        'template-id',
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
      expect(emailContent).toContain('template-id');
      expect(emailContent).toContain('template-name');
      expect(emailContent).toContain('supplier1');
    });
  });

  describe('template-submitted email', () => {
    const mockTemplate = mockDeep<TemplateDto>({
      id: 'template-id',
      templateType: 'LETTER',
      files: {
        proofs: {
          proof1: { fileName: 'proof1.pdf', supplier: 'supplier1' },
          proof2: { fileName: 'proof2.pdf', supplier: 'supplier2' },
        },
      },
      updatedAt: '2022-01-01T00:00:00Z',
      name: 'template-name',
    });

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
        templateId: template.id,
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
          'Not sending template submitted email to supplier because no recipients are configured',
        templateId: mockTemplate.id,
        supplier: 'supplier2',
      });
      expect(logger.info).toHaveBeenCalledWith({
        description:
          'Not sending template submitted email to supplier because no recipients are configured',
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

      expect(sesClient.send).toHaveBeenCalledTimes(2);
      expect(sesClient.send).toHaveBeenCalledWith(
        expect.any(SendRawEmailCommand)
      );

      // check email to supplier1
      const sesCall1Input = sesClient.send.mock.calls[0][0];
      if (!(sesCall1Input instanceof SendRawEmailCommand)) {
        throw new TypeError('Unexpected command given to SES client');
      }

      const supplier1EmailContent =
        sesCall1Input.input.RawMessage?.Data?.toString();
      expect(supplier1EmailContent).toContain('template-id');
      expect(supplier1EmailContent).toContain('template-name');
      expect(supplier1EmailContent).toContain('supplier1');
      expect(supplier1EmailContent).not.toContain('supplier2');
      expect(supplier1EmailContent).toContain('proof1.pdf');
      expect(supplier1EmailContent).not.toContain('proof2.pdf');

      // check email to supplier2
      const sesCall2Input = sesClient.send.mock.calls[1][0];
      if (!(sesCall2Input instanceof SendRawEmailCommand)) {
        throw new TypeError('Unexpected command given to SES client');
      }

      const supplier2EmailContent =
        sesCall2Input.input.RawMessage?.Data?.toString();
      expect(supplier2EmailContent).toContain('template-id');
      expect(supplier2EmailContent).toContain('template-name');
      expect(supplier2EmailContent).not.toContain('supplier1');
      expect(supplier2EmailContent).toContain('supplier2');
      expect(supplier2EmailContent).not.toContain('proof1.pdf');
      expect(supplier2EmailContent).toContain('proof2.pdf');
    });
  });
});
