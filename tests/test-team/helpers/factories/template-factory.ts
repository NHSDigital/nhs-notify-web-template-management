import type {
  Language,
  LetterType,
  LetterVersion,
} from 'nhs-notify-backend-client';
import type { TestUser } from '../auth/cognito-auth-helper';
import type { RenderFile, Template } from '../types';
import { randomUUID } from 'node:crypto';

export const defaultFileRenders = {
  initialRender: {
    fileName: 'initial-render.pdf',
    currentVersion: 'v1',
    status: 'RENDERED',
    pageCount: 1,
  } satisfies RenderFile,
  shortFormRender: {
    fileName: 'short-form-render.pdf',
    currentVersion: 'v1',
    status: 'RENDERED',
    pageCount: 1,
  } satisfies RenderFile,
  longFormRender: {
    fileName: 'long-form-render.pdf',
    currentVersion: 'v1',
    status: 'RENDERED',
    pageCount: 2,
  } satisfies RenderFile,
};

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
      letterVersion?: LetterVersion;
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
      initialRender?: Partial<RenderFile> | false;
      shortFormRender?: Partial<RenderFile> | false;
      longFormRender?: Partial<RenderFile> | false;
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

    if (options?.initialRender !== false) {
      files.initialRender = {
        ...defaultFileRenders.initialRender,
        ...options?.initialRender,
      };
    }

    if (
      options?.shortFormRender !== undefined &&
      options.shortFormRender !== false
    ) {
      files.shortFormRender = {
        ...defaultFileRenders.shortFormRender,
        ...options.shortFormRender,
      };
    }
    if (
      options?.longFormRender !== undefined &&
      options.longFormRender !== false
    ) {
      files.longFormRender = {
        ...defaultFileRenders.longFormRender,
        ...options.longFormRender,
      };
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
