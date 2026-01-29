import {
  $AuthoringLetterProperties,
  $CreatePdfProofingLetterProperties,
  $CreateUpdateNonLetter,
  $CreateUpdateTemplate,
  $LetterProperties,
  $PdfProofingLetterProperties,
  $TemplateFilter,
} from '../../schemas';
import type { CreateUpdateTemplate } from '../../types/generated';

describe('Template schemas', () => {
  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(100_001),
        subject: 'Test Subject',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(919),
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(5001),
        templateType: 'NHS_APP',
      },
    },
  ])(
    '$data.templateType - should fail validation, when max character length exceeded',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            message: [
              `Too big: expected string to have <=${data.message.length - 1} characters`,
            ],
          },
        })
      );
    }
  );

  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        message: ' ',
        subject: ' ',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        message: ' ',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        message: ' ',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        templateType: 'LETTER',
        campaignId: 'campaign-id',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '$data.templateType - should fail validation, when name, message or subject is whitespace',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'Too small: expected string to have >=1 characters';

      const emptyFields = Object.entries(data).flatMap(([k, v]) =>
        v === ' ' ? [k] : []
      );

      const errors = {
        fieldErrors: Object.fromEntries(
          emptyFields.map((field) => [field, [errorMessage]])
        ),
      };

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        message: '',
        subject: '',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        message: '',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        message: '',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        templateType: 'LETTER',
        campaignId: 'campaign-id',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '$data.templateType - should fail validation, when name, message or subject is empty',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'Too small: expected string to have >=1 characters';

      const emptyFields = Object.entries(data).flatMap(([k, v]) =>
        v === '' ? [k] : []
      );

      const errors = {
        fieldErrors: Object.fromEntries(
          emptyFields.map((field) => [field, [errorMessage]])
        ),
      };

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test('$CreateUpdateNonLetter should fail when input is a letter', () => {
    const letter: CreateUpdateTemplate = {
      templateType: 'LETTER',
      letterType: 'x1',
      language: 'ar',
      name: 'letter',
      campaignId: 'campaign-id',
    };

    const result = $CreateUpdateNonLetter.safeParse(letter);

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          templateType: ['Invalid input'],
        },
      })
    );
  });

  test('Email template fields - should fail validation, when no subject', async () => {
    const result = $CreateUpdateTemplate.safeParse({
      name: 'Test Template',
      message: 'a'.repeat(100_000),
      templateType: 'EMAIL',
    });

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          subject: ['Invalid input: expected string, received undefined'],
        },
      })
    );
  });

  test('Letter template fields - should fail validation, when no letterType', async () => {
    const result = $CreatePdfProofingLetterProperties.safeParse({
      name: 'Test Template',
      campaignId: 'campaign-id',
      templateType: 'LETTER',
      language: 'en',
    });

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          letterType: ['Invalid option: expected one of "q4"|"x0"|"x1"'],
        },
      })
    );
  });

  describe('$CreateUpdateTemplate', () => {
    const commonFields = {
      name: 'Test Template',
    };

    test.each([
      {
        ...commonFields,
        subject: 'Test Subject',
        message: 'This is a test template',
        templateType: 'EMAIL',
      },
      {
        ...commonFields,
        message: 'This is a test template',
        templateType: 'SMS',
      },
      {
        ...commonFields,
        message: 'This is a test template',
        templateType: 'NHS_APP',
      },
      {
        ...commonFields,
        campaignId: 'campaign-id',
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
      },
    ])('should pass validation %p', async (template) => {
      const result = $CreateUpdateTemplate.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });

  describe('$PdfProofingLetterProperties', () => {
    const validPdfProofingLetter = {
      templateType: 'LETTER',
      letterType: 'x0',
      language: 'en',
      letterVersion: 'PDF_PROOFING',
      files: {
        pdfTemplate: {
          fileName: 'test.pdf',
          currentVersion: '1',
          virusScanStatus: 'PASSED',
        },
      },
    };

    test('should pass validation for valid PDF_PROOFING letter', () => {
      const result = $PdfProofingLetterProperties.safeParse(
        validPdfProofingLetter
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validPdfProofingLetter);
    });

    test('should fail validation when letterVersion is not PDF_PROOFING', () => {
      const result = $PdfProofingLetterProperties.safeParse({
        ...validPdfProofingLetter,
        letterVersion: 'AUTHORING',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('$AuthoringLetterProperties', () => {
    const validAuthoringLetter = {
      templateType: 'LETTER',
      letterType: 'x0',
      language: 'en',
      letterVersion: 'AUTHORING',
      letterVariantId: 'variant-123',
      sidesCount: 2,
    };

    test('should pass validation for valid AUTHORING letter', () => {
      const result = $AuthoringLetterProperties.safeParse(validAuthoringLetter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validAuthoringLetter);
    });

    test('should fail validation when letterVersion is not AUTHORING', () => {
      const result = $AuthoringLetterProperties.safeParse({
        ...validAuthoringLetter,
        letterVersion: 'PDF_PROOFING',
      });

      expect(result.success).toBe(false);
    });

    test('should fail validation when required fields are missing', () => {
      const result = $AuthoringLetterProperties.safeParse({
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
        letterVersion: 'AUTHORING',
      });

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual(
        expect.objectContaining({
          letterVariantId: expect.any(Array),
          sidesCount: expect.any(Array),
        })
      );
    });
  });

  describe('$LetterProperties', () => {
    const validLetterWithVersion = {
      templateType: 'LETTER',
      letterType: 'x0',
      language: 'en',
      letterVersion: 'PDF_PROOFING',
      files: {
        pdfTemplate: {
          fileName: 'test.pdf',
          currentVersion: '1',
          virusScanStatus: 'PASSED',
        },
      },
    };

    test('should pass validation when letterVersion is provided', () => {
      const result = $LetterProperties.safeParse(validLetterWithVersion);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validLetterWithVersion);
    });

    test('should default letterVersion to PDF_PROOFING when not provided', () => {
      const letterWithoutVersion = {
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
        files: {
          pdfTemplate: {
            fileName: 'test.pdf',
            currentVersion: '1',
            virusScanStatus: 'PASSED',
          },
        },
      };

      const result = $LetterProperties.safeParse(letterWithoutVersion);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...letterWithoutVersion,
        letterVersion: 'PDF_PROOFING',
      });
    });

    test('should not add letterVersion for non-LETTER templates', () => {
      const emailTemplate = {
        templateType: 'EMAIL',
        subject: 'Test',
        message: 'Hello',
      };

      const result = $LetterProperties.safeParse(emailTemplate);

      // Should fail validation since it's not a letter
      expect(result.success).toBe(false);
    });

    test('should pass validation for AUTHORING letter', () => {
      const authoringLetter = {
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
        letterVersion: 'AUTHORING',
        letterVariantId: 'variant-123',
        sidesCount: 2,
      };

      const result = $LetterProperties.safeParse(authoringLetter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(authoringLetter);
    });
  });

  describe('$TemplateFilter', () => {
    test.each(['templateType', 'language', 'letterType', 'excludeLanguage'])(
      '$TemplateFilter should fail when unknown $filter field is provided',
      (filterField) => {
        const filter = {
          [filterField]: 'UNKNOWN',
        };

        const result = $TemplateFilter.safeParse(filter);

        expect(result.error?.flatten()).toEqual(
          expect.objectContaining({
            fieldErrors: {
              [filterField]: [
                expect.stringContaining('Invalid option: expected one of'),
              ],
            },
          })
        );
      }
    );

    test('should fail when unknown templateStatus is provided', () => {
      const filter = {
        templateStatus: ['UNKNOWN'],
      };

      const result = $TemplateFilter.safeParse(filter);

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            templateStatus: [expect.stringContaining('Invalid')],
          },
        })
      );
    });

    test('should transform single templateStatus string to array', () => {
      const filter = {
        templateStatus: 'SUBMITTED',
      };

      const result = $TemplateFilter.safeParse(filter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ templateStatus: ['SUBMITTED'] });
    });

    test('should transform multiple templateStatus values to array', () => {
      const filter = {
        templateStatus: ['SUBMITTED', 'PROOF_AVAILABLE'],
      };

      const result = $TemplateFilter.safeParse(filter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        templateStatus: ['SUBMITTED', 'PROOF_AVAILABLE'],
      });
    });

    test.each([
      {
        templateStatus: ['SUBMITTED'],
      },
      {
        templateType: 'LETTER',
      },
      {
        language: 'en',
      },
      {
        excludeLanguage: 'fr',
      },
      {
        letterType: 'x0',
      },
      {
        templateStatus: ['SUBMITTED', 'PROOF_AVAILABLE'],
        templateType: 'LETTER',
        excludeLanguage: 'en',
        letterType: 'x0',
      },
    ])('should pass template filter validation %p', async (filter) => {
      const result = $TemplateFilter.safeParse(filter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(filter);
    });
  });
});
