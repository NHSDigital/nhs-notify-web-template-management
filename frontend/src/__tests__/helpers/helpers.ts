import { mockDeep } from 'jest-mock-extended';
import { TemplateDto } from 'nhs-notify-backend-client';

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

export const NHS_APP_TEMPLATE: TemplateDto = {
  id: 'template-id',
  templateType: 'NHS_APP',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const EMAIL_TEMPLATE: TemplateDto = {
  id: 'template-id',
  templateType: 'EMAIL',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  message: 'message',
  subject: 'subject',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const SMS_TEMPLATE: TemplateDto = {
  id: 'template-id',
  templateType: 'SMS',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

export const LETTER_TEMPLATE: TemplateDto = {
  id: 'template-id',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
      currentVersion: '8ADED236B5AE',
      virusScanStatus: 'PASSED',
    },
  },
  name: 'name',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;
