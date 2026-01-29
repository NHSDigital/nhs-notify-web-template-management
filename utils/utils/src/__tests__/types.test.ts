import {
  assertPdfProofingLetter,
  PdfProofingLetterTemplate,
  AuthoringLetterTemplate,
  UnexpectedLetterVersionError,
} from '../types';

describe('types', () => {
  describe('UnexpectedLetterVersionError', () => {
    it('creates error with correct message and name', () => {
      const error = new UnexpectedLetterVersionError('AUTHORING');

      expect(error.message).toBe('ERR_UNEXPECTED_LETTER_VERSION: AUTHORING');
      expect(error.name).toBe('UnexpectedLetterVersionError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('assertPdfProofingLetter', () => {
    const basePdfProofingTemplate: PdfProofingLetterTemplate = {
      id: 'template-id',
      name: 'Test Template',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      letterVersion: 'PDF_PROOFING',
      letterType: 'x0',
      language: 'en',
      files: {
        pdfTemplate: {
          fileName: 'test.pdf',
          currentVersion: '1',
          virusScanStatus: 'PASSED',
        },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lockNumber: 0,
    };

    it('returns the template when letterVersion is PDF_PROOFING', () => {
      const result = assertPdfProofingLetter(basePdfProofingTemplate);

      expect(result).toBe(basePdfProofingTemplate);
    });

    it('throws UnexpectedLetterVersionError when letterVersion is not PDF_PROOFING', () => {
      const authoringTemplate = {
        ...basePdfProofingTemplate,
        letterVersion: 'AUTHORING',
      } as unknown as AuthoringLetterTemplate;

      expect(() => assertPdfProofingLetter(authoringTemplate)).toThrow(
        UnexpectedLetterVersionError
      );
      expect(() => assertPdfProofingLetter(authoringTemplate)).toThrow(
        'ERR_UNEXPECTED_LETTER_VERSION: AUTHORING'
      );
    });
  });
});
