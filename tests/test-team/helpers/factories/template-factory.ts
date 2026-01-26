import { Language, LetterType } from 'nhs-notify-backend-client';
import { TestUser } from '../auth/cognito-auth-helper';
import { Template } from '../types';
import { randomUUID } from 'node:crypto';

export const TemplateFactory = {
  createEmailTemplate: (
    id: string,
    user: TestUser,
    name: string = 'test',
    templateStatus: string = 'NOT_YET_SUBMITTED'
  ): Template => {
    return TemplateFactory.create({
      campaignId: user.campaignId,
      clientId: user.clientId,
      id,
      message: 'test-message',
      name,
      owner: `CLIENT#${user.clientId}`,
      subject: 'test-subject',
      templateType: 'EMAIL',
      templateStatus,
    });
  },

  createSmsTemplate: (
    id: string,
    user: TestUser,
    name: string = 'test',
    templateStatus: string = 'NOT_YET_SUBMITTED'
  ): Template => {
    return TemplateFactory.create({
      campaignId: user.campaignId,
      clientId: user.clientId,
      id,
      message: 'test-message',
      name,
      owner: `CLIENT#${user.clientId}`,
      templateType: 'SMS',
      templateStatus,
    });
  },

  createNhsAppTemplate: (
    id: string,
    user: TestUser,
    name: string = 'test',
    templateStatus: string = 'NOT_YET_SUBMITTED'
  ): Template => {
    return TemplateFactory.create({
      campaignId: user.campaignId,
      clientId: user.clientId,
      id,
      message: 'test-message',
      name,
      owner: `CLIENT#${user.clientId}`,
      templateType: 'NHS_APP',
      templateStatus,
    });
  },

  uploadLetterTemplate: (
    id: string,
    user: TestUser,
    name: string,
    templateStatus = 'NOT_YET_SUBMITTED',
    virusScanStatus = 'PASSED',
    options?: {
      letterType?: LetterType;
      language?: Language;
    }
  ): Template => {
    return TemplateFactory.create({
      campaignId: 'campaign-id',
      clientId: user.clientId,
      files: {
        pdfTemplate: {
          fileName: 'file.pdf',
          currentVersion: randomUUID(),
          virusScanStatus,
        },
        testDataCsv: {
          fileName: 'test-data.csv',
          currentVersion: randomUUID(),
          virusScanStatus,
        },
        proofs: {},
      },
      personalisationParameters: [],
      id,
      language: options?.language || 'en',
      letterType: options?.letterType || 'x0',
      name,
      owner: `CLIENT#${user.clientId}`,
      templateStatus,
      templateType: 'LETTER',
      proofingEnabled: true,
    });
  },

  create: (
    template: Partial<Template> & {
      id: string;
      owner: string;
      name: string;
      templateType: string;
    }
  ): Template => {
    return {
      templateStatus: 'NOT_YET_SUBMITTED',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 0,
      ...template,
    };
  },
};
