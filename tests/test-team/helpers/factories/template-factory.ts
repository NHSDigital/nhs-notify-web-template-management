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
      letterVersion: 'PDF',
      name,
      owner: `CLIENT#${user.clientId}`,
      templateStatus,
      templateType: 'LETTER',
      proofingEnabled: true,
    });
  },

  createAuthoringLetterTemplate: (
    id: string,
    user: TestUser,
    name: string,
    templateStatus = 'NOT_YET_SUBMITTED',
    options?: {
      letterType?: LetterType;
      language?: Language;
      letterVariantId?: string;
      campaignId?: string | null;
      initialRender?: {
        fileName: string;
        currentVersion: string;
        status: string;
        pageCount: number;
      };
      shortFormRender?: {
        fileName: string;
        currentVersion: string;
        status: string;
        pageCount: number;
      };
      longFormRender?: {
        fileName: string;
        currentVersion: string;
        status: string;
        pageCount: number;
      };
      customPersonalisation?: string[];
      systemPersonalisation?: string[];
      validationErrors?: string[];
    }
  ): Template => {
    const campaignId =
      options?.campaignId === null
        ? undefined
        : (options?.campaignId ?? 'campaign-id');

    const files: Record<string, unknown> = {};
    if (options?.initialRender) {
      files.initialRender = options.initialRender;
    }
    if (options?.shortFormRender) {
      files.shortFormRender = options.shortFormRender;
    }
    if (options?.longFormRender) {
      files.longFormRender = options.longFormRender;
    }

    return TemplateFactory.create({
      ...(campaignId && { campaignId }),
      clientId: user.clientId,
      files,
      id,
      language: options?.language || 'en',
      letterType: options?.letterType || 'x0',
      letterVersion: 'AUTHORING',
      name,
      owner: `CLIENT#${user.clientId}`,
      templateStatus,
      templateType: 'LETTER',
      letterVariantId: options?.letterVariantId,
      ...(options?.customPersonalisation && {
        customPersonalisation: options.customPersonalisation,
      }),
      ...(options?.systemPersonalisation && {
        systemPersonalisation: options.systemPersonalisation,
      }),
      ...(options?.validationErrors && {
        validationErrors: options.validationErrors,
      }),
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
