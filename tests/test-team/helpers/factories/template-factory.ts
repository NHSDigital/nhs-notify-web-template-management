import { Template } from '../types';
import { randomUUID } from 'node:crypto';

export const TemplateFactory = {
  createEmailTemplate: (
    id: string,
    owner: string,
    name: string = 'test'
  ): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name,
      clientId: randomUUID(),
      userId: randomUUID(),
      templateType: 'EMAIL',
      message: 'test-message',
      subject: 'test-subject',
    });
  },

  createSmsTemplate: (id: string, owner: string): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name: 'test',
      clientId: randomUUID(),
      userId: randomUUID(),
      templateType: 'SMS',
      message: 'test-message',
    });
  },

  createNhsAppTemplate: (id: string, owner: string): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name: 'test-name',
      clientId: randomUUID(),
      userId: randomUUID(),
      templateType: 'NHS_APP',
      message: 'test-message',
    });
  },

  createLetterTemplate: (
    id: string,
    owner: string,
    name: string,
    templateStatus = 'NOT_YET_SUBMITTED',
    virusScanStatus = 'PASSED'
  ): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name,
      clientId: randomUUID(),
      userId: randomUUID(),
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
      clientId: randomUUID(),
      userId: randomUUID(),
      templateStatus: 'NOT_YET_SUBMITTED',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...template,
    };
  },
};
