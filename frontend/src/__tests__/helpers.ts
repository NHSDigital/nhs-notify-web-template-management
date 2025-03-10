import { mockDeep } from 'jest-mock-extended';
import { Language, LetterType, TemplateDTO } from 'nhs-notify-backend-client';
import {
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';

function* iteratorFromList<T>(list: T[]): IterableIterator<T> {
  for (const item of list) {
    yield item;
  }
}

export const getMockFormData = (formData: Record<string, string>) =>
  mockDeep<FormData>({
    entries: jest.fn().mockImplementation(() => {
      const formDataEntries = Object.entries(formData);

      return iteratorFromList(formDataEntries);
    }),
    get: (key: string) => formData[key],
  });

export const NHS_APP_TEMPLATE: TemplateDTO = {
  id: 'template-id',
  templateType: 'NHS_APP',
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
} as const;

export const EMAIL_TEMPLATE: TemplateDTO = {
  id: 'template-id',
  templateType: 'EMAIL',
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  message: 'message',
  subject: 'subject',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
} as const;

export const SMS_TEMPLATE: TemplateDTO = {
  id: 'template-id',
  templateType: 'SMS',
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
} as const;

export const LETTER_TEMPLATE: TemplateDTO = {
  id: 'template-id',
  templateType: 'LETTER',
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  letterType: LetterType.X0,
  language: Language.EN,
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
    },
  },
  name: 'name',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
} as const;
