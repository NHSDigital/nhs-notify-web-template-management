import {
  $AuthoringLetterFiles,
  $AuthoringLetterProperties,
  $CreateAuthoringLetterProperties,
  $CreatePdfLetterProperties,
  $CreateUpdateNonLetter,
  $CreateUpdateTemplate,
  $LetterProperties,
  $PatchTemplate,
  $PdfLetterProperties,
  $TemplateDto,
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
        letterVersion: 'PDF',
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
        letterVersion: 'PDF',
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
      letterVersion: 'PDF',
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
        formErrors: ['Invalid input'],
      })
    );
  });

  test('CreatePdfLetterProperties - should fail validation, when no letterType', async () => {
    const result = $CreatePdfLetterProperties.safeParse({
      name: 'Test Template',
      campaignId: 'campaign-id',
      templateType: 'LETTER',
      language: 'en',
      letterVersion: 'PDF',
    });

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          letterType: ['Invalid option: expected one of "q4"|"x0"|"x1"'],
        },
      })
    );
  });

  test('CreateAuthoringLetterProperties - should fail validation, when no letterType', async () => {
    const result = $CreateAuthoringLetterProperties.safeParse({
      name: 'Test Template',
      campaignId: 'campaign-id',
      templateType: 'LETTER',
      language: 'en',
      letterVersion: 'AUTHORING',
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
        letterVersion: 'PDF',
      },
    ])('should pass validation %p', async (template) => {
      const result = $CreateUpdateTemplate.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });

  describe('$PdfLetterProperties', () => {
    const validPdfProofingLetter = {
      templateType: 'LETTER',
      letterType: 'x0',
      language: 'en',
      letterVersion: 'PDF',
      files: {
        pdfTemplate: {
          fileName: 'test.pdf',
          currentVersion: '1',
          virusScanStatus: 'PASSED',
        },
      },
    };

    test('should pass validation for valid PDF letter', () => {
      const result = $PdfLetterProperties.safeParse(validPdfProofingLetter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validPdfProofingLetter);
    });

    test('should fail validation when letterVersion is not PDF', () => {
      const result = $PdfLetterProperties.safeParse({
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
      files: {
        initialRender: {
          fileName: 'render.pdf',
          currentVersion: 'v1',
          status: 'RENDERED',
          pageCount: 2,
        },
        docxTemplate: {
          currentVersion: 'version-id',
          fileName: 'template.docx',
          virusScanStatus: 'PASSED',
        },
      },
      systemPersonalisation: [],
    };

    test('should pass validation for valid AUTHORING letter', () => {
      const result = $AuthoringLetterProperties.safeParse(validAuthoringLetter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validAuthoringLetter);
    });

    test('should fail validation when letterVersion is not AUTHORING', () => {
      const result = $AuthoringLetterProperties.safeParse({
        ...validAuthoringLetter,
        letterVersion: 'PDF',
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
      expect(result.error?.flatten().fieldErrors).toEqual({
        files: expect.any(Array),
      });
    });
  });

  describe('$AuthoringLetterFiles', () => {
    test.each([
      {
        description: 'template only',
        files: {
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PASSED',
          },
        },
      },
      {
        description: 'template and initialRender only',
        files: {
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PASSED',
          },
          initialRender: {
            fileName: 'initial.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 2,
          },
        },
      },
      {
        description: 'all render types',
        files: {
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PASSED',
          },
          initialRender: {
            fileName: 'initial.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 2,
          },
          shortFormRender: {
            fileName: 'short.pdf',
            currentVersion: 'v2',
            status: 'RENDERED',
            personalisationParameters: { firstName: 'John' },
            systemPersonalisationPackId: 'pack-123',
            pageCount: 2,
          },
          longFormRender: {
            fileName: 'long.pdf',
            currentVersion: 'v3',
            status: 'PENDING',
            personalisationParameters: { firstName: 'Jane' },
            systemPersonalisationPackId: 'pack-456',
            pageCount: 2,
          },
        },
      },
    ])('should pass validation for $description', ({ files }) => {
      const result = $AuthoringLetterFiles.safeParse(files);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(files);
    });

    test.each([
      {
        description: 'invalid render status',
        files: {
          initialRender: {
            fileName: 'initial.pdf',
            currentVersion: 'v1',
            status: 'INVALID_STATUS',
            pageCount: 2,
          },
        },
      },
      {
        description: 'shortFormRender missing required fields',
        files: {
          shortFormRender: {
            fileName: 'short.pdf',
            currentVersion: 'v2',
            status: 'RENDERED',
            pageCount: 2,
          },
        },
      },
      {
        description: 'initialRender missing pageCount',
        files: {
          initialRender: {
            fileName: 'initial.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
          },
        },
      },
    ])('should fail validation for $description', ({ files }) => {
      const result = $AuthoringLetterFiles.safeParse(files);

      expect(result.success).toBe(false);
    });
  });

  describe('$LetterProperties', () => {
    const validLetterWithVersion = {
      templateType: 'LETTER',
      letterType: 'x0',
      language: 'en',
      letterVersion: 'PDF',
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

    test('should default letterVersion to PDF when not provided', () => {
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
        letterVersion: 'PDF',
      });
    });

    test('should pass validation for AUTHORING letter', () => {
      const authoringLetter = {
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
        letterVersion: 'AUTHORING',
        letterVariantId: 'variant-123',
        files: {
          initialRender: {
            fileName: 'render.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 2,
          },
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PASSED',
          },
        },
        systemPersonalisation: [],
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

  describe('$TemplateDto', () => {
    test('should default letterVersion to PDF when not provided for LETTER template', () => {
      const letterWithoutVersion = {
        id: 'test-id',
        name: 'Test Letter',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x0',
        language: 'en',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        files: {
          pdfTemplate: {
            currentVersion: '1',
            fileName: 'test.pdf',
            virusScanStatus: 'PASSED',
          },
        },
      };

      const result = $TemplateDto.safeParse(letterWithoutVersion);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...letterWithoutVersion,
        lockNumber: 0,
        letterVersion: 'PDF',
      });
    });

    test('should pass validation for LETTER template with letterVersion provided', () => {
      const letterWithVersion = {
        id: 'test-id',
        name: 'Test Letter',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x0',
        language: 'en',
        letterVersion: 'PDF',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        files: {
          pdfTemplate: {
            currentVersion: '1',
            fileName: 'test.pdf',
            virusScanStatus: 'PASSED',
          },
        },
      };

      const result = $TemplateDto.safeParse(letterWithVersion);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...letterWithVersion,
        lockNumber: 0,
      });
    });

    test('should pass validation for AUTHORING letter template', () => {
      const authoringLetter = {
        id: 'test-id',
        name: 'Test Authoring Letter',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x0',
        language: 'en',
        letterVersion: 'AUTHORING',
        letterVariantId: 'variant-123',
        files: {
          initialRender: {
            fileName: 'render.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 2,
          },
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PASSED',
          },
        },
        systemPersonalisation: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = $TemplateDto.safeParse(authoringLetter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...authoringLetter,
        lockNumber: 0,
      });
    });

    test('should pass validation for non-LETTER templates', () => {
      const emailTemplate = {
        id: 'test-id',
        name: 'Test Email',
        templateType: 'EMAIL',
        templateStatus: 'NOT_YET_SUBMITTED',
        subject: 'Test Subject',
        message: 'Test message',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = $TemplateDto.safeParse(emailTemplate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...emailTemplate,
        lockNumber: 0,
      });
    });
  });

  describe('$PatchTemplate', () => {
    it('should pass validation when name is provided', () => {
      const result = $PatchTemplate.safeParse({
        name: 'Updated Template Name',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'Updated Template Name',
      });
    });

    it('should pass validation when campaignId is provided', () => {
      const result = $PatchTemplate.safeParse({
        campaignId: 'Updated Campaign',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        campaignId: 'Updated Campaign',
      });
    });

    it('should fail validation when name is empty', () => {
      const result = $PatchTemplate.safeParse({
        name: '',
      });

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            name: ['Too small: expected string to have >=1 characters'],
          },
        })
      );
    });

    it('should fail validation when name is whitespace only', () => {
      const result = $PatchTemplate.safeParse({
        name: '   ',
      });

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            name: ['Too small: expected string to have >=1 characters'],
          },
        })
      );
    });

    it('should fail validation when campaignId is empty', () => {
      const result = $PatchTemplate.safeParse({
        campaignId: '',
      });

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            campaignId: ['Too small: expected string to have >=1 characters'],
          },
        })
      );
    });

    it('should fail validation when campaignId is whitespace only', () => {
      const result = $PatchTemplate.safeParse({
        campaignId: '   ',
      });

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            campaignId: ['Too small: expected string to have >=1 characters'],
          },
        })
      );
    });

    it('should fail validation when no fields are provided', () => {
      const result = $PatchTemplate.safeParse({});

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          formErrors: expect.arrayContaining([expect.any(String)]),
        })
      );
    });
  });
});
