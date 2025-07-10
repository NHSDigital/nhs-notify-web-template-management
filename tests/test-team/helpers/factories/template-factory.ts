import { TestUser } from '../auth/cognito-auth-helper';
import { Template } from '../types';
import { randomUUID } from 'node:crypto';

export const TemplateFactory = {
  createEmailTemplate: (
    id: string,
    user: TestUser,
    name: string = 'test'
  ): Template => {
    return TemplateFactory.create({
      clientId: user.clientId,
      id,
      owner: user.userId,
      name,
      templateType: 'EMAIL',
      message: 'test-message',
      subject: 'test-subject',
    });
  },

  createSmsTemplate: (id: string, user: TestUser): Template => {
    return TemplateFactory.create({
      clientId: user.clientId,
      id,
      owner: user.userId,
      name: 'test',
      templateType: 'SMS',
      message: 'test-message',
    });
  },

  createNhsAppTemplate: (id: string, user: TestUser): Template => {
    return TemplateFactory.create({
      clientId: user.clientId,
      id,
      owner: user.userId,
      name: 'test-name',
      templateType: 'NHS_APP',
      message: 'test-message',
    });
  },

  createLetterTemplate: (
    id: string,
    user: TestUser,
    name: string,
    templateStatus = 'NOT_YET_SUBMITTED',
    virusScanStatus = 'PASSED'
  ): Template => {
    return TemplateFactory.create({
      clientId: user.clientId,
      id,
      owner: user.userId,
      name,
      templateStatus,
      templateType: 'LETTER',
      letterType: 'x0',
      language: 'en',
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
