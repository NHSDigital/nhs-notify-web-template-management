import {
  chooseLanguageLetterTemplatesAction,
  $ChooseLanguageLetterTemplates,
} from '@forms/ChooseLanguageLetterTemplates/server-action';
import {
  AUTHORING_LETTER_TEMPLATE,
  getMockFormData,
  ROUTING_CONFIG,
  PDF_LETTER_TEMPLATE,
} from '@testhelpers/helpers';
import { updateRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');

const mockRedirect = jest.mocked(redirect);
const mockUpdateRoutingConfig = jest.mocked(updateRoutingConfig);

const FRENCH_LETTER: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'french-id',
  language: 'fr',
  name: 'French Letter',
};

const POLISH_LETTER: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'polish-id',
  language: 'pl',
  name: 'Polish Letter',
};

const SPANISH_LETTER: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'spanish-id',
  language: 'es',
  name: 'Spanish Letter',
};

const GERMAN_AUTHORING_LETTER: LetterTemplate = {
  ...AUTHORING_LETTER_TEMPLATE,
  id: 'german-authoring-id',
  language: 'de',
  name: 'German Authoring Letter',
};

describe('chooseLanguageLetterTemplatesAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update message plan with language template for cascade with no conditional templates', async () => {
    await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: {
          ...ROUTING_CONFIG,
          cascade: [
            {
              ...ROUTING_CONFIG.cascade[0],
            },
          ],
        },
        cascadeIndex: 0,
        templateList: [FRENCH_LETTER],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${FRENCH_LETTER.id}`]: `${FRENCH_LETTER.id}:fr`,
        lockNumber: '42',
      })
    );

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      ROUTING_CONFIG.id,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            conditionalTemplates: [
              {
                language: 'fr',
                templateId: FRENCH_LETTER.id,
                supplierReferences: FRENCH_LETTER.supplierReferences,
              },
            ],
          }),
        ],
      }),
      42
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      `/message-plans/edit-message-plan/${ROUTING_CONFIG.id}`,
      RedirectType.push
    );
  });

  test('should include multiple language templates in update when multiple languages are selected', async () => {
    await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: {
          ...ROUTING_CONFIG,
          cascade: [
            {
              ...ROUTING_CONFIG.cascade[0],
            },
          ],
        },
        cascadeIndex: 0,
        templateList: [FRENCH_LETTER, POLISH_LETTER, SPANISH_LETTER],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${FRENCH_LETTER.id}`]: `${FRENCH_LETTER.id}:fr`,
        [`template_${POLISH_LETTER.id}`]: `${POLISH_LETTER.id}:pl`,
        lockNumber: '42',
      })
    );

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      ROUTING_CONFIG.id,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            conditionalTemplates: expect.arrayContaining([
              expect.objectContaining({
                language: 'fr',
                templateId: FRENCH_LETTER.id,
              }),
              expect.objectContaining({
                language: 'pl',
                templateId: POLISH_LETTER.id,
              }),
            ]),
          }),
        ],
      }),
      42
    );
  });

  test('should update message plan with authoring letter template selection', async () => {
    await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: {
          ...ROUTING_CONFIG,
          cascade: [
            {
              ...ROUTING_CONFIG.cascade[0],
            },
          ],
        },
        cascadeIndex: 0,
        templateList: [GERMAN_AUTHORING_LETTER],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${GERMAN_AUTHORING_LETTER.id}`]: `${GERMAN_AUTHORING_LETTER.id}:de`,
        lockNumber: '42',
      })
    );

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      ROUTING_CONFIG.id,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            conditionalTemplates: [
              expect.objectContaining({
                language: 'de',
                templateId: GERMAN_AUTHORING_LETTER.id,
              }),
            ],
          }),
        ],
      }),
      42
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      `/message-plans/edit-message-plan/${ROUTING_CONFIG.id}`,
      RedirectType.push
    );
  });

  test('should replace existing language templates with new selection', async () => {
    await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: {
          ...ROUTING_CONFIG,
          cascade: [
            {
              ...ROUTING_CONFIG.cascade[0],
              conditionalTemplates: [
                {
                  templateId: FRENCH_LETTER.id,
                  language: 'fr',
                  supplierReferences: {},
                },
                {
                  templateId: POLISH_LETTER.id,
                  language: 'pl',
                  supplierReferences: {},
                },
              ],
            },
          ],
        },
        cascadeIndex: 0,
        templateList: [FRENCH_LETTER, POLISH_LETTER, SPANISH_LETTER],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${SPANISH_LETTER.id}`]: `${SPANISH_LETTER.id}:fr`,
        lockNumber: '42',
      })
    );

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      ROUTING_CONFIG.id,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            conditionalTemplates: [
              expect.objectContaining({
                language: 'es',
                templateId: SPANISH_LETTER.id,
              }),
            ],
          }),
        ],
      }),
      42
    );
  });

  test('should preserve non-language conditional templates when updating language templates', async () => {
    await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: {
          ...ROUTING_CONFIG,
          cascade: [
            {
              ...ROUTING_CONFIG.cascade[0],
              conditionalTemplates: [
                {
                  templateId: 'large-print-id',
                  accessibleFormat: 'x1',
                  supplierReferences: {},
                },
                {
                  templateId: FRENCH_LETTER.id,
                  language: 'fr',
                  supplierReferences: {},
                },
              ],
            },
          ],
        },
        cascadeIndex: 0,
        templateList: [FRENCH_LETTER, POLISH_LETTER],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${POLISH_LETTER.id}`]: `${POLISH_LETTER.id}:pl`,
        lockNumber: '42',
      })
    );

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      ROUTING_CONFIG.id,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            conditionalTemplates: expect.arrayContaining([
              expect.objectContaining({
                accessibleFormat: 'x1',
                templateId: 'large-print-id',
              }),
              expect.objectContaining({
                language: 'pl',
                templateId: POLISH_LETTER.id,
              }),
            ]),
          }),
        ],
      }),
      42
    );
  });

  test('should return error when selecting templates with duplicate languages', async () => {
    const FRENCH_LETTER_2: LetterTemplate = {
      ...PDF_LETTER_TEMPLATE,
      id: 'french-2-id',
      language: 'fr',
      name: 'Another French Letter',
    };

    const result = await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: ROUTING_CONFIG,
        cascadeIndex: 0,
        templateList: [FRENCH_LETTER, FRENCH_LETTER_2],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${FRENCH_LETTER.id}`]: `${FRENCH_LETTER.id}:fr`,
        [`template_${FRENCH_LETTER_2.id}`]: `${FRENCH_LETTER_2.id}:fr`,
        lockNumber: '42',
      })
    );

    expect(result.errorType).toBe('duplicate');
    expect(result.errorState?.fieldErrors?.['language-templates']).toHaveLength(
      1
    );
    expect(result.errorState?.fieldErrors?.['language-templates']?.[0]).toBe(
      'Choose only one template for each language'
    );
  });

  test('should return error when lockNumber is missing', async () => {
    const result = await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: ROUTING_CONFIG,
        cascadeIndex: 0,
        templateList: [FRENCH_LETTER],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${FRENCH_LETTER.id}`]: `${FRENCH_LETTER.id}:fr`,
      })
    );

    expect(result.errorState).toBeDefined();
    expect(mockUpdateRoutingConfig).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test('should return error when lockNumber is invalid', async () => {
    const result = await chooseLanguageLetterTemplatesAction(
      {
        messagePlan: ROUTING_CONFIG,
        cascadeIndex: 0,
        templateList: [FRENCH_LETTER],
        pageHeading: 'Choose language templates',
      },
      getMockFormData({
        [`template_${FRENCH_LETTER.id}`]: `${FRENCH_LETTER.id}:fr`,
        lockNumber: 'invalid',
      })
    );

    expect(result.errorState).toBeDefined();
    expect(mockUpdateRoutingConfig).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe('$ChooseLanguageLetterTemplates Zod schema', () => {
  const errorMessage = 'At least one template must be selected';
  const schema = $ChooseLanguageLetterTemplates(errorMessage);

  test('should pass validation when at least one template checkbox is selected', () => {
    const validData = {
      'template_abc-123': 'abc-123:fr',
      lockNumber: '42',
    };

    const result = schema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  test('should pass validation with multiple template checkboxes selected', () => {
    const validData = {
      'template_abc-123': 'abc-123:fr',
      'template_def-456': 'def-456:pl',
      lockNumber: '42',
    };

    const result = schema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  test('should fail validation when no template checkboxes are selected', () => {
    const invalidData = {
      lockNumber: '42',
    };

    const result = schema.safeParse(invalidData);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(errorMessage);
  });

  test('should fail validation when only non-template fields are present', () => {
    const invalidData = {
      otherField: 'some-value',
      lockNumber: '42',
    };

    const result = schema.safeParse(invalidData);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(errorMessage);
  });
});
