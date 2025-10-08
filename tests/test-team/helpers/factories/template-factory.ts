import { TestUser } from '../auth/cognito-auth-helper';
import { testClients } from '../client/client-helper';
import { Template } from '../types';
import { randomUUID } from 'node:crypto';

export const TemplateFactory = {
  createEmailTemplate: (
    id: string,
    user: TestUser,
    name: string = 'test'
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
    });
  },

  createSmsTemplate: (
    id: string,
    user: TestUser,
    name: string = 'test'
  ): Template => {
    return TemplateFactory.create({
      campaignId: user.campaignId,
      clientId: user.clientId,
      id,
      message: 'test-message',
      name,
      owner: `CLIENT#${user.clientId}`,
      templateType: 'SMS',
    });
  },

  createNhsAppTemplate: (
    id: string,
    user: TestUser,
    name: string = 'test'
  ): Template => {
    return TemplateFactory.create({
      campaignId: user.campaignId,
      clientId: user.clientId,
      id,
      message: 'test-message',
      name,
      owner: `CLIENT#${user.clientId}`,
      templateType: 'NHS_APP',
    });
  },

  uploadLetterTemplate: (
    id: string,
    user: TestUser,
    name: string,
    templateStatus = 'NOT_YET_SUBMITTED',
    virusScanStatus = 'PASSED'
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
      language: 'en',
      letterType: 'x0',
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
      ...template,
    };
  },
};
