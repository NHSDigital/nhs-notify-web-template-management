import { mockDeep } from 'jest-mock-extended';
import {
  LetterVariant,
  RoutingConfig,
} from 'nhs-notify-web-template-management-types';
import {
  AuthoringLetterTemplate,
  EmailTemplate,
  NHSAppTemplate,
  PdfLetterTemplate,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';

function* iteratorFromList<T>(list: T[]): IterableIterator<T> {
  for (const item of list) {
    yield item;
  }
}

export const getMockFormData = (formData: Record<string, string | File>) =>
  mockDeep<FormData>({
    entries: jest.fn().mockImplementation(() => {
      const formDataEntries = Object.entries(formData);

      return iteratorFromList(formDataEntries);
    }),
    get: (key: string) => formData[key],
  });

export const NHS_APP_TEMPLATE: NHSAppTemplate = {
  id: 'app-template-id',
  templateType: 'NHS_APP',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'app template name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const EMAIL_TEMPLATE: EmailTemplate = {
  id: 'email-template-id',
  templateType: 'EMAIL',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'email template name',
  message: 'message',
  subject: 'subject',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const SMS_TEMPLATE: SMSTemplate = {
  id: 'sms-template-id',
  templateType: 'SMS',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'sms template name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const PDF_LETTER_TEMPLATE: PdfLetterTemplate = {
  id: 'letter-template-id',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  letterType: 'x0',
  language: 'en',
  letterVersion: 'PDF',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
      currentVersion: '8ADED236B5AE',
      virusScanStatus: 'PASSED',
    },
  },
  name: 'letter template name',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const LARGE_PRINT_LETTER_TEMPLATE: PdfLetterTemplate = {
  id: 'large-print-letter-template-id',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  letterType: 'x1',
  language: 'en',
  letterVersion: 'PDF',
  files: {
    pdfTemplate: {
      fileName: 'large-print-template.pdf',
      currentVersion: '9BDED347C6BF',
      virusScanStatus: 'PASSED',
    },
  },
  name: 'large print letter template name',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const AUTHORING_LETTER_TEMPLATE: AuthoringLetterTemplate = {
  id: 'authoring-letter-template-id',
  clientId: 'client-1',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  letterType: 'x0',
  language: 'en',
  letterVersion: 'AUTHORING',
  letterVariantId: 'variant-123',
  files: {
    docxTemplate: {
      currentVersion: 'version-id',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      fileName: 'render.pdf',
      currentVersion: 'v1',
      status: 'RENDERED',
      pageCount: 2,
    },
  },
  systemPersonalisation: [],
  name: 'authoring letter template name',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const ROUTING_CONFIG: RoutingConfig = {
  id: 'fbb81055-79b9-4759-ac07-d191ae57be34',
  name: 'Autumn Campaign Plan',
  status: 'DRAFT' as const,
  clientId: 'client-1',
  campaignId: 'campaign-2',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  cascadeGroupOverrides: [],
  cascade: [
    {
      cascadeGroups: ['standard'],
      channel: 'NHSAPP',
      channelType: 'primary',
      defaultTemplateId: NHS_APP_TEMPLATE.id,
    },
    {
      cascadeGroups: ['standard'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: EMAIL_TEMPLATE.id,
    },
    {
      cascadeGroups: ['standard'],
      channel: 'SMS',
      channelType: 'primary',
      defaultTemplateId: SMS_TEMPLATE.id,
    },
    {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: PDF_LETTER_TEMPLATE.id,
    },
  ],
  lockNumber: 0,
  defaultCascadeGroup: 'standard',
};

export const makeLetterVariant = (
  overrides: Partial<LetterVariant> = {}
): LetterVariant => ({
  id: 'variant-1',
  name: 'Standard C5',
  sheetSize: 'A4',
  maxSheets: 5,
  bothSides: true,
  printColour: 'black',
  envelopeSize: 'C5',
  dispatchTime: 'standard',
  postage: 'economy',
  status: 'PROD',
  type: 'STANDARD',
  ...overrides,
});
