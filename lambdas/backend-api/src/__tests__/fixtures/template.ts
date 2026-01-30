import type {
  CreateUpdateTemplate,
  EmailProperties,
  NhsAppProperties,
  SmsProperties,
  TemplateDto,
  CreatePdfProofingLetterProperties,
} from 'nhs-notify-backend-client';
import { WithAttachments } from '../../infra/template-repository';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';

export const userId = 'user-id';
export const clientId = 'client-id';
export const ownerWithClientPrefix = `CLIENT#${clientId}`;
export const user = { userId, clientId };

const emailProperties: EmailProperties = {
  message: 'message',
  subject: 'pickles',
  templateType: 'EMAIL',
};

const smsProperties: SmsProperties = {
  message: 'message',
  templateType: 'SMS',
};

const nhsAppProperties: NhsAppProperties = {
  message: 'message',
  templateType: 'NHS_APP',
};

const letterProperties: WithAttachments<CreatePdfProofingLetterProperties> = {
  templateType: 'LETTER',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
      currentVersion: 'a',
      virusScanStatus: 'PENDING',
    },
    testDataCsv: {
      fileName: 'test.csv',
      currentVersion: 'a',
      virusScanStatus: 'PENDING',
    },
  },
  campaignId: 'campaign-id',
};

const createTemplateProperties = { name: 'name' };

const dtoProperties = {
  templateStatus: 'NOT_YET_SUBMITTED' as const,
  id: 'abc-def-ghi-jkl-123',
  createdAt: '2024-12-27T00:00:00.000Z',
  updatedAt: '2024-12-27T00:00:00.000Z',
  updatedBy: `INTERNAL_USER#${userId}`,
  clientId,
  createdBy: `INTERNAL_USER#${userId}`,
  lockNumber: 0,
};

const databaseTemplateProperties = {
  owner: ownerWithClientPrefix,
  version: 1,
};

export type TemplateFixture<T> = {
  createUpdateTemplate: WithAttachments<CreateUpdateTemplate> & T;
  dtoTemplate: TemplateDto & T;
  databaseTemplate: DatabaseTemplate & T;
};

export const makeAppTemplate = (
  overrides: Partial<DatabaseTemplate & NhsAppProperties> = {}
): TemplateFixture<NhsAppProperties> => {
  const createUpdateTemplate = {
    ...createTemplateProperties,
    ...nhsAppProperties,
    ...overrides,
  };
  const dtoTemplate = {
    ...createUpdateTemplate,
    ...dtoProperties,
  };
  const databaseTemplate = {
    ...dtoTemplate,
    ...databaseTemplateProperties,
  };

  return { createUpdateTemplate, dtoTemplate, databaseTemplate };
};

export const makeEmailTemplate = (
  overrides: Partial<TemplateDto & EmailProperties> = {}
): TemplateFixture<EmailProperties> => {
  const createUpdateTemplate = {
    ...createTemplateProperties,
    ...emailProperties,
    ...overrides,
  };
  const dtoTemplate = {
    ...createUpdateTemplate,
    ...dtoProperties,
  };
  const databaseTemplate = {
    ...dtoTemplate,
    ...databaseTemplateProperties,
  };

  return { createUpdateTemplate, dtoTemplate, databaseTemplate };
};

export const makeSmsTemplate = (
  overrides: Partial<TemplateDto & SmsProperties> = {}
): TemplateFixture<SmsProperties> => {
  const createUpdateTemplate = {
    ...createTemplateProperties,
    ...smsProperties,
    ...overrides,
  };
  const dtoTemplate = {
    ...createUpdateTemplate,
    ...dtoProperties,
  };
  const databaseTemplate = {
    ...dtoTemplate,
    ...databaseTemplateProperties,
  };

  return { createUpdateTemplate, dtoTemplate, databaseTemplate };
};

export const makeLetterTemplate = (
  overrides: Partial<
    TemplateDto & WithAttachments<CreatePdfProofingLetterProperties>
  > = {}
): TemplateFixture<CreatePdfProofingLetterProperties> => {
  const createUpdateTemplate = {
    ...createTemplateProperties,
    ...letterProperties,
    ...overrides,
  };
  const dtoTemplate = {
    ...createUpdateTemplate,
    ...dtoProperties,
    letterVersion: 'PDF' as const,
  };
  const databaseTemplate = {
    ...dtoTemplate,
    ...databaseTemplateProperties,
  };

  return { createUpdateTemplate, dtoTemplate, databaseTemplate };
};
