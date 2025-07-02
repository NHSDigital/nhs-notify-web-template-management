import { mockDeep } from 'jest-mock-extended';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { EmailClient } from '../../../templates/infra/email-client';
import { TemplateDto } from 'nhs-notify-backend-client';

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(() => '<html>{{templateId}}</html>'),
}));

jest.mock('mimetext', () => ({
  createMimeMessage: () => {
    const msg = {
      setSender: jest.fn(),
      setTo: jest.fn(),
      setSubject: jest.fn(),
      addMessage: jest.fn(),
      asRaw: jest.fn(() => 'raw-email-content'),
    };
    return msg;
  },
}));

describe('EmailClient', () => {
  const recipientEmails = {
    supplier1: ['supplier1@nhs.net'],
    supplier2: ['supplier2@nhs.net', 'also-supplier2@nhs.net'],
  };

  const sesClient = mockDeep<SESClient>();
  const logger = mockDeep<Logger>();

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
    name: 'Test Template',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not send email when no email address provided', async () => {
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
      name: 'Test Template',
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
    expect(logger.info).toHaveBeenCalled();
  });
});
