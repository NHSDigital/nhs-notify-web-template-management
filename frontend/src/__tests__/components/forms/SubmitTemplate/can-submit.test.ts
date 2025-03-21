import { canSubmit } from '@forms/SubmitTemplate/can-submit';
import { TemplateDto } from 'nhs-notify-backend-client';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';

const baseTemplate = {
  templateType: 'NHS_APP',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  message: 'body',
  id: '1',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
} satisfies TemplateDto;

const mockLetterTemplate = {
  ...baseTemplate,
  templateType: 'LETTER',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'file.pdf',
      currentVersion: '1',
      virusScanStatus: 'PASSED',
    },
    testDataCsv: {
      fileName: 'test-data.csv',
      currentVersion: '1',
      virusScanStatus: 'PASSED',
    },
  },
} satisfies LetterTemplate;

describe('canSubmit', () => {
  test('should return false when no temnplate', () => {
    expect(canSubmit(undefined as unknown as TemplateDto)).toBe(false);
  });

  test.each([
    {
      ...mockLetterTemplate,
      files: {
        ...mockLetterTemplate.files,
        pdfTemplate: {
          ...mockLetterTemplate.files.pdfTemplate,
          virusScanStatus: 'FAILED',
        },
      },
    } satisfies LetterTemplate,
    {
      ...mockLetterTemplate,
      files: {
        ...mockLetterTemplate.files,
        testDataCsv: {
          ...mockLetterTemplate.files.testDataCsv,
          virusScanStatus: 'FAILED',
        },
      },
    } satisfies LetterTemplate,
    {
      ...mockLetterTemplate,
      files: {
        ...mockLetterTemplate.files,
        proofs: [
          {
            virusScanStatus: 'FAILED',
            fileName: 'proof2.pdf',
            currentVersion: '1',
          },
        ],
      },
    } satisfies LetterTemplate,
  ])(
    'should return false LETTER templates has not passed virus scan',
    (template) => {
      expect(canSubmit(template)).toBe(false);
    }
  );

  test('should return false when template does not have NOT_YET_SUBMITTED templateStatus', () => {
    expect(
      canSubmit({
        ...baseTemplate,
        templateStatus: 'SUBMITTED',
      })
    ).toBe(false);
  });

  test('should return true when template has NOT_YET_SUBMITTED templateStatus', () => {
    expect(canSubmit(baseTemplate)).toBe(true);
  });

  test('should return true when LETTER templates has passed virus scan', () => {
    expect(canSubmit(mockLetterTemplate)).toBe(true);
  });
});
