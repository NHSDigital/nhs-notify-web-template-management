import { getTemplateStatusErrors } from '@utils/get-template-status-errors';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';

const baseTemplate: LetterTemplate = {
  id: 'template-123',
  name: 'Test Letter',
  templateStatus: 'NOT_YET_SUBMITTED',
  templateType: 'LETTER',
  letterType: 'x0',
  letterVersion: 'PDF',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
      currentVersion: 'version-1',
      virusScanStatus: 'PASSED',
    },
  },
  proofingEnabled: true,
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('getTemplateStatusErrors', () => {
  it('returns empty array for valid template status', () => {
    const errors = getTemplateStatusErrors(baseTemplate);

    expect(errors).toEqual([]);
  });

  it('returns virus scan errors for VIRUS_SCAN_FAILED status', () => {
    const template: LetterTemplate = {
      ...baseTemplate,
      templateStatus: 'VIRUS_SCAN_FAILED',
    };

    const errors = getTemplateStatusErrors(template);

    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('virus');
    expect(errors[1]).toContain('Create a new letter template');
  });

  it('returns validation errors for VALIDATION_FAILED status', () => {
    const template: LetterTemplate = {
      ...baseTemplate,
      templateStatus: 'VALIDATION_FAILED',
    };

    const errors = getTemplateStatusErrors(template);

    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('personalisation fields');
    expect(errors[1]).toContain('Check that the personalisation fields');
  });

  it('returns empty array for other statuses', () => {
    const statuses = [
      'PENDING_UPLOAD',
      'PENDING_VALIDATION',
      'PENDING_PROOF_REQUEST',
      'WAITING_FOR_PROOF',
      'PROOF_AVAILABLE',
      'SUBMITTED',
    ] as const;

    for (const status of statuses) {
      const template: LetterTemplate = {
        ...baseTemplate,
        templateStatus: status,
      };

      const errors = getTemplateStatusErrors(template);

      expect(errors).toEqual([]);
    }
  });
});
