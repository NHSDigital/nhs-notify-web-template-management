import {
  getMessagePlanTemplateIds,
  getSelectedLanguageTemplateIds,
  shouldRemoveTemplate,
  removeTemplatesFromConditionalTemplates,
  removeTemplatesFromCascadeItem,
  getRemainingAccessibleFormats,
  getRemainingLanguages,
  buildCascadeGroupOverridesFromCascade,
  buildCascadeGroupsForItem,
  getConditionalTemplatesForItem,
  addConditionalTemplateToCascadeItem,
  addConditionalTemplateToCascade,
  addDefaultTemplateToCascade,
  type ConditionalTemplate,
  type MessagePlanTemplates,
} from '@utils/routing-utils';
import type {
  CascadeItem,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-backend-client';
import {
  LARGE_PRINT_LETTER_TEMPLATE,
  LETTER_TEMPLATE,
} from '@testhelpers/helpers';

const baseConfig: RoutingConfig = {
  id: 'test-id',
  name: 'Test message plan',
  status: 'DRAFT',
  clientId: 'client-1',
  campaignId: 'campaign-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  cascade: [],
  cascadeGroupOverrides: [],
  defaultCascadeGroup: 'standard',
};

describe('getMessagePlanTemplateIds', () => {
  it('should collect unique template IDs from defaults and conditionals', () => {
    const plan: RoutingConfig = {
      ...baseConfig,
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: 'template-1',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          conditionalTemplates: [
            { templateId: 'template-2', language: 'fr' },
            { templateId: 'template-3', language: 'fr' },
          ],
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: 'template-1',
          conditionalTemplates: [{ templateId: 'template-2', language: 'fr' }],
        },
      ],
    };

    const ids = [...getMessagePlanTemplateIds(plan)].sort();
    expect(ids).toEqual(['template-1', 'template-2', 'template-3']);
  });

  it('should return empty set when there are no templates', () => {
    const plan: RoutingConfig = {
      ...baseConfig,
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
    };
    const ids = getMessagePlanTemplateIds(plan);
    expect(ids.size).toBe(0);
  });
});

describe('getSelectedLanguageTemplateIds', () => {
  it('should return language templates with templateId', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'default-template',
      conditionalTemplates: [
        { templateId: 'template-1', language: 'fr' },
        { templateId: 'template-2', language: 'es' },
      ],
    };

    const result = getSelectedLanguageTemplateIds(cascadeItem);

    expect(result).toEqual([
      { language: 'fr', templateId: 'template-1' },
      { language: 'es', templateId: 'template-2' },
    ]);
  });

  it('should not include accessible format templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['translations', 'accessible'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'default-template',
      conditionalTemplates: [
        { templateId: 'template-1', language: 'fr' },
        { templateId: 'template-2', accessibleFormat: 'q4' },
        { templateId: 'template-3', language: 'es' },
      ],
    };

    const result = getSelectedLanguageTemplateIds(cascadeItem);

    expect(result).toEqual([
      { language: 'fr', templateId: 'template-1' },
      { language: 'es', templateId: 'template-3' },
    ]);
  });

  it('should filter out language templates with null templateId', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'default-template',
      conditionalTemplates: [
        { templateId: 'template-1', language: 'fr' },
        { templateId: null, language: 'pl' },
        { templateId: 'template-3', language: 'es' },
      ],
    };

    const result = getSelectedLanguageTemplateIds(cascadeItem);

    expect(result).toEqual([
      { language: 'fr', templateId: 'template-1' },
      { language: 'es', templateId: 'template-3' },
    ]);
  });

  it('should return empty array when no conditional templates exist', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'default-template',
    };

    const result = getSelectedLanguageTemplateIds(cascadeItem);

    expect(result).toEqual([]);
  });

  it('should return empty array when conditionalTemplates is undefined', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'default-template',
    };

    const result = getSelectedLanguageTemplateIds(cascadeItem);

    expect(result).toEqual([]);
  });

  it('should return empty array when only accessible format templates exist', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['accessible'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'default-template',
      conditionalTemplates: [
        { templateId: 'template-1', accessibleFormat: 'q4' },
        { templateId: 'template-2', accessibleFormat: 'x0' },
      ],
    };

    const result = getSelectedLanguageTemplateIds(cascadeItem);

    expect(result).toEqual([]);
  });
});

describe('shouldRemoveTemplate', () => {
  it('should return true when template ID is in removal list', () => {
    expect(
      shouldRemoveTemplate('template-1', ['template-1', 'template-2'])
    ).toBe(true);
  });

  it('should return false when template ID is not in removal list', () => {
    expect(
      shouldRemoveTemplate('template-3', ['template-1', 'template-2'])
    ).toBe(false);
  });

  it('should return false when template ID is null', () => {
    expect(shouldRemoveTemplate(null, ['template-1', 'template-2'])).toBe(
      false
    );
  });

  it('should return false when template ID is undefined', () => {
    expect(shouldRemoveTemplate(undefined, ['template-1', 'template-2'])).toBe(
      false
    );
  });

  it('should return false when template ID is empty string', () => {
    expect(shouldRemoveTemplate('', ['template-1', 'template-2'])).toBe(false);
  });
});

describe('removeTemplatesFromConditionalTemplates', () => {
  it('should remove templates matching the IDs to remove', () => {
    const conditionalTemplates: ConditionalTemplate[] = [
      { templateId: 'template-1', language: 'fr' },
      { templateId: 'template-2', language: 'es' },
      { templateId: 'template-3', accessibleFormat: 'q4' },
    ];

    const result = removeTemplatesFromConditionalTemplates(
      conditionalTemplates,
      ['template-1', 'template-3']
    );

    expect(result).toEqual([{ templateId: 'template-2', language: 'es' }]);
  });

  it('should keep templates with null templateId', () => {
    const conditionalTemplates: ConditionalTemplate[] = [
      { templateId: 'template-1', language: 'fr' },
      { templateId: null, language: 'es' },
    ];

    const result = removeTemplatesFromConditionalTemplates(
      conditionalTemplates,
      ['template-1']
    );

    expect(result).toEqual([{ templateId: null, language: 'es' }]);
  });

  it('should return empty array when all templates are removed', () => {
    const conditionalTemplates: ConditionalTemplate[] = [
      { templateId: 'template-1', language: 'fr' },
      { templateId: 'template-2', language: 'es' },
    ];

    const result = removeTemplatesFromConditionalTemplates(
      conditionalTemplates,
      ['template-1', 'template-2']
    );

    expect(result).toEqual([]);
  });
});

describe('removeTemplatesFromCascadeItem', () => {
  it('should remove default template when in removal list', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
    };

    const result = removeTemplatesFromCascadeItem(cascadeItem, ['template-1']);

    expect(result.defaultTemplateId).toBeNull();
  });

  it('should keep default template when not in removal list', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
    };

    const result = removeTemplatesFromCascadeItem(cascadeItem, ['template-2']);

    expect(result.defaultTemplateId).toBe('template-1');
  });

  it('should remove conditional templates in removal list', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['translations'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: null,
      conditionalTemplates: [
        { templateId: 'template-1', language: 'fr' },
        { templateId: 'template-2', language: 'es' },
        { templateId: 'template-3', language: 'de' },
      ],
    };

    const result = removeTemplatesFromCascadeItem(cascadeItem, [
      'template-1',
      'template-3',
    ]);

    expect(result.conditionalTemplates).toHaveLength(1);
    expect(result.conditionalTemplates).toEqual([
      { templateId: 'template-2', language: 'es' },
    ]);
  });

  it('should remove both default and conditional templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['translations'],
      channel: 'SMS',
      channelType: 'primary',
      defaultTemplateId: 'template-default',
      conditionalTemplates: [
        { templateId: 'template-1', language: 'fr' },
        { templateId: 'template-2', language: 'es' },
      ],
    };

    const result = removeTemplatesFromCascadeItem(cascadeItem, [
      'template-default',
      'template-1',
    ]);

    expect(result.defaultTemplateId).toBeNull();
    expect(result.conditionalTemplates).toHaveLength(1);
    expect(result.conditionalTemplates).toEqual([
      { templateId: 'template-2', language: 'es' },
    ]);
  });

  it('should handle cascade item with no conditional templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'NHSAPP',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
    };

    const result = removeTemplatesFromCascadeItem(cascadeItem, ['template-2']);

    expect(result.defaultTemplateId).toBe('template-1');
    expect(result.conditionalTemplates).toBeUndefined();
  });

  it('should not mutate the original cascade item', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [{ templateId: 'template-2', language: 'fr' }],
    };

    const originalDefaultId = cascadeItem.defaultTemplateId;
    const originalConditionalLength = cascadeItem.conditionalTemplates?.length;

    removeTemplatesFromCascadeItem(cascadeItem, ['template-1', 'template-2']);

    expect(cascadeItem.defaultTemplateId).toBe(originalDefaultId);
    expect(cascadeItem.conditionalTemplates).toHaveLength(
      originalConditionalLength!
    );
  });

  it('should update cascadeGroups when removing all conditional templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'standard-template',
      conditionalTemplates: [{ templateId: 'template-1', language: 'fr' }],
    };

    const result = removeTemplatesFromCascadeItem(cascadeItem, ['template-1']);

    expect(result.conditionalTemplates).toBeUndefined();
    expect(result.cascadeGroups).toEqual(['standard']);
  });

  it('should update cascadeGroups when removing some but not all conditional templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'accessible', 'translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'standard-template',
      conditionalTemplates: [
        { templateId: 'template-1', language: 'fr' },
        { templateId: 'template-2', accessibleFormat: 'q4' },
      ],
    };

    const result = removeTemplatesFromCascadeItem(cascadeItem, ['template-1']);

    expect(result.cascadeGroups).toEqual(['standard', 'accessible']);
  });
});

describe('getConditionalTemplatesForItem', () => {
  const templates: MessagePlanTemplates = {
    'template-1': { id: 'template-1', name: 'Template 1' } as TemplateDto,
    'template-2': { id: 'template-2', name: 'Template 2' } as TemplateDto,
    'template-3': { id: 'template-3', name: 'Template 3' } as TemplateDto,
  };

  it('should return empty object when no conditional templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
    };

    const result = getConditionalTemplatesForItem(cascadeItem, templates);

    expect(result).toEqual({});
  });

  it('should return empty object when conditionalTemplates is empty array', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [],
    };

    const result = getConditionalTemplatesForItem(cascadeItem, templates);

    expect(result).toEqual({});
  });

  it('should return templates that exist in templates object', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [
        { templateId: 'template-2', language: 'fr' },
        { templateId: 'template-3', language: 'es' },
      ],
    };

    const result = getConditionalTemplatesForItem(cascadeItem, templates);

    expect(result).toEqual({
      'template-2': templates['template-2'],
      'template-3': templates['template-3'],
    });
  });

  it('should filter out templates with a missing/invalid templateId', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [
        { templateId: 'template-2', language: 'fr' },
        { templateId: null, language: 'es' },
        { accessibleFormat: 'x1' } as ConditionalTemplate,
      ],
    };

    const result = getConditionalTemplatesForItem(cascadeItem, templates);

    expect(result).toEqual({
      'template-2': templates['template-2'],
    });
  });

  it('should not include templates that are missing from templates object', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [
        { templateId: 'template-2', language: 'fr' },
        { templateId: 'template-999', language: 'es' },
      ],
    };

    const result = getConditionalTemplatesForItem(cascadeItem, templates);

    expect(result).toEqual({
      'template-2': templates['template-2'],
    });
  });

  it('should handle mix of accessible and language templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'accessible', 'translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [
        { templateId: 'template-2', accessibleFormat: 'q4' },
        { templateId: 'template-3', language: 'fr' },
      ],
    };

    const result = getConditionalTemplatesForItem(cascadeItem, templates);

    expect(result).toEqual({
      'template-2': templates['template-2'],
      'template-3': templates['template-3'],
    });
  });
});

describe('buildCascadeGroupsForItem', () => {
  it('should return only standard group when no conditional templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
    };

    expect(buildCascadeGroupsForItem(cascadeItem)).toEqual(['standard']);
  });

  it('should return standard and accessible groups when accessible format present', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [
        { templateId: 'template-2', accessibleFormat: 'q4' },
      ],
    };

    expect(buildCascadeGroupsForItem(cascadeItem)).toEqual([
      'standard',
      'accessible',
    ]);
  });

  it('should return standard and translations groups when language present', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [{ templateId: 'template-2', language: 'fr' }],
    };

    expect(buildCascadeGroupsForItem(cascadeItem)).toEqual([
      'standard',
      'translations',
    ]);
  });

  it('should return all groups when both accessible format and language present', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [
        { templateId: 'template-2', accessibleFormat: 'q4' },
        { templateId: 'template-3', language: 'fr' },
      ],
    };

    expect(buildCascadeGroupsForItem(cascadeItem)).toEqual([
      'standard',
      'accessible',
      'translations',
    ]);
  });

  it('should return only standard group when conditional templates have missing templateIds', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [
        { templateId: null, accessibleFormat: 'q4' },
        { templateId: 'template-2', language: 'fr' },
      ],
    };

    expect(buildCascadeGroupsForItem(cascadeItem)).toEqual([
      'standard',
      'translations',
    ]);
  });

  it('should return only standard when conditional templates array is empty', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'template-1',
      conditionalTemplates: [],
    };

    expect(buildCascadeGroupsForItem(cascadeItem)).toEqual(['standard']);
  });
});

describe('getRemainingAccessibleFormats', () => {
  it('should collect all unique accessible format types', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['accessible'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: null,
        conditionalTemplates: [
          { templateId: 'template-1', accessibleFormat: 'q4' },
          { templateId: 'template-2', accessibleFormat: 'x0' },
        ],
      },
      {
        cascadeGroups: ['accessible'],
        channel: 'LETTER',
        channelType: 'secondary',
        defaultTemplateId: null,
        conditionalTemplates: [
          { templateId: 'template-3', accessibleFormat: 'q4' },
        ],
      },
    ];

    const result = getRemainingAccessibleFormats(cascade);

    expect(result.sort()).toEqual(['q4', 'x0'].sort());
  });

  it('should ignore templates with null templateId', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['accessible'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: null,
        conditionalTemplates: [
          { templateId: 'template-1', accessibleFormat: 'q4' },
          { templateId: null, accessibleFormat: 'x0' },
        ],
      },
    ];

    const result = getRemainingAccessibleFormats(cascade);

    expect(result).toEqual(['q4']);
  });

  it('should return empty array when no accessible templates exist', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'template-1',
      },
    ];

    const result = getRemainingAccessibleFormats(cascade);

    expect(result).toEqual([]);
  });
});

describe('getRemainingLanguages', () => {
  it('should collect all unique language types', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['translations'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
        conditionalTemplates: [
          { templateId: 'template-1', language: 'fr' },
          { templateId: 'template-2', language: 'es' },
        ],
      },
      {
        cascadeGroups: ['translations'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: null,
        conditionalTemplates: [{ templateId: 'template-3', language: 'fr' }],
      },
    ];

    const result = getRemainingLanguages(cascade);

    expect(result.sort()).toEqual(['es', 'fr']);
  });

  it('should ignore templates with null templateId', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['translations'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
        conditionalTemplates: [
          { templateId: 'template-1', language: 'fr' },
          { templateId: null, language: 'es' },
        ],
      },
    ];

    const result = getRemainingLanguages(cascade);

    expect(result).toEqual(['fr']);
  });

  it('should return empty array when no language templates exist', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'template-1',
      },
    ];

    const result = getRemainingLanguages(cascade);

    expect(result).toEqual([]);
  });
});

describe('buildCascadeGroupOverridesFromCascade', () => {
  it('should build accessible group from cascade with accessible formats', () => {
    const updatedCascade: CascadeItem[] = [
      {
        cascadeGroups: ['accessible'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: null,
        conditionalTemplates: [
          { templateId: 'template-1', accessibleFormat: 'q4' },
        ],
      },
    ];

    const result = buildCascadeGroupOverridesFromCascade(updatedCascade);

    expect(result).toEqual([{ name: 'accessible', accessibleFormat: ['q4'] }]);
  });

  it('should build translations group from cascade with languages', () => {
    const updatedCascade: CascadeItem[] = [
      {
        cascadeGroups: ['translations'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
        conditionalTemplates: [
          { templateId: 'template-1', language: 'fr' },
          { templateId: 'template-2', language: 'es' },
        ],
      },
    ];

    const result = buildCascadeGroupOverridesFromCascade(updatedCascade);

    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      name: 'translations',
      language: ['fr', 'es'],
    });
  });

  it('should return empty array when no conditionals exist', () => {
    const updatedCascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'template-1',
      },
    ];

    const result = buildCascadeGroupOverridesFromCascade(updatedCascade);

    expect(result).toEqual([]);
  });

  it('should build complete overrides from complex cascade with mixed template types', () => {
    const updatedCascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'email-template',
      },
      {
        cascadeGroups: ['standard', 'accessible'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: 'standard-letter',
        conditionalTemplates: [
          { templateId: 'large-print', accessibleFormat: 'x1' },
          { templateId: 'audio', accessibleFormat: 'q4' },
        ],
      },
      {
        cascadeGroups: ['standard', 'translations'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: 'sms-template',
        conditionalTemplates: [
          { templateId: 'french-sms', language: 'fr' },
          { templateId: 'spanish-sms', language: 'es' },
        ],
      },
      {
        cascadeGroups: ['standard', 'accessible', 'translations'],
        channel: 'LETTER',
        channelType: 'secondary',
        defaultTemplateId: 'secondary-letter',
        conditionalTemplates: [
          { templateId: 'braille', accessibleFormat: 'x0' },
          { templateId: 'polish-letter', language: 'pl' },
        ],
      },
    ];

    const result = buildCascadeGroupOverridesFromCascade(updatedCascade);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'accessible',
      accessibleFormat: expect.arrayContaining(['x1', 'q4', 'x0']),
    });
    expect(result[1]).toEqual({
      name: 'translations',
      language: expect.arrayContaining(['fr', 'es', 'pl']),
    });
  });
});

describe('addDefaultTemplateToCascade', () => {
  it('should add default template to cascade at specified index', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ];

    const result = addDefaultTemplateToCascade(cascade, 0, 'new-template-id');

    expect(result[0].defaultTemplateId).toBe('new-template-id');
  });

  it('should add supplier references when template is a letter with supplier refs', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ];

    const letterTemplate = {
      ...LETTER_TEMPLATE,
      id: 'letter-template-id',
      supplierReferences: { MBA: 'supplier-ref-123' },
    };

    const result = addDefaultTemplateToCascade(
      cascade,
      0,
      'letter-template-id',
      letterTemplate
    );

    expect(result[0].defaultTemplateId).toBe('letter-template-id');
    expect(result[0].supplierReferences).toEqual({ MBA: 'supplier-ref-123' });
  });

  it('should not add supplier references when template is not a letter', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ];

    const emailTemplate = {
      id: 'email-template-id',
      name: 'Email Template',
      templateType: 'EMAIL',
      message: 'Test',
      subject: 'Test',
    } as TemplateDto;

    const result = addDefaultTemplateToCascade(
      cascade,
      0,
      'email-template-id',
      emailTemplate
    );

    expect(result[0].defaultTemplateId).toBe('email-template-id');
    expect(result[0].supplierReferences).toBeUndefined();
  });

  it('should not mutate original cascade', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'old-template',
      },
    ];

    addDefaultTemplateToCascade(cascade, 0, 'new-template');

    expect(cascade[0].defaultTemplateId).toBe('old-template');
  });

  it('should preserve existing cascade item properties', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard', 'accessible'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: 'old-template',
        conditionalTemplates: [
          { templateId: 'conditional', accessibleFormat: 'x1' },
        ],
        supplierReferences: { MBA: 'existing-ref' },
      },
    ];

    const result = addDefaultTemplateToCascade(cascade, 0, 'new-template');

    expect(result[0].cascadeGroups).toEqual(['standard', 'accessible']);
    expect(result[0].conditionalTemplates).toHaveLength(1);
    expect(result[0].supplierReferences).toEqual({ MBA: 'existing-ref' });
  });

  it('should set defaultTemplateId on cascade item with conditionals', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['accessible'],
        channel: 'LETTER',
        channelType: 'primary',
        conditionalTemplates: [
          { templateId: 'accessible-template', accessibleFormat: 'x1' },
        ],
      },
    ];

    const result = addDefaultTemplateToCascade(cascade, 0, 'default-template');

    expect(result[0].defaultTemplateId).toBe('default-template');
    expect(result[0].conditionalTemplates).toHaveLength(1);
  });
});

describe('addConditionalTemplateToCascadeItem', () => {
  it('should add conditional template to cascade item', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'standard-template',
    };

    const largePrintLetterTemplate = {
      ...LARGE_PRINT_LETTER_TEMPLATE,
      id: 'accessible-template',
      letterType: 'x1' as const,
      supplierReferences: { MBA: 'ref-123' },
    };

    const result = addConditionalTemplateToCascadeItem(
      cascadeItem,
      largePrintLetterTemplate
    );

    expect(result.conditionalTemplates).toHaveLength(1);
    expect(result.conditionalTemplates![0]).toEqual({
      accessibleFormat: 'x1',
      templateId: 'accessible-template',
      supplierReferences: { MBA: 'ref-123' },
    });
  });

  it('should append to existing conditional templates', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'accessible'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'standard-template',
      conditionalTemplates: [
        { templateId: 'existing-template', accessibleFormat: 'q4' },
      ],
    };

    const largePrintLetterTemplate = {
      ...LARGE_PRINT_LETTER_TEMPLATE,
      id: 'new-template',
      letterType: 'x1' as const,
      supplierReferences: { MBA: 'ref-456' },
    };

    const result = addConditionalTemplateToCascadeItem(
      cascadeItem,
      largePrintLetterTemplate
    );

    expect(result.conditionalTemplates).toHaveLength(2);
    expect(result.conditionalTemplates![1]).toEqual({
      accessibleFormat: 'x1',
      templateId: 'new-template',
      supplierReferences: { MBA: 'ref-456' },
    });
  });

  it('should not mutate original cascade item', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'standard-template',
    };

    const largePrintLetterTemplate = {
      ...LETTER_TEMPLATE,
      id: 'accessible-template',
      letterType: 'x1' as const,
    };

    addConditionalTemplateToCascadeItem(cascadeItem, largePrintLetterTemplate);

    expect(cascadeItem.conditionalTemplates).toBeUndefined();
  });

  it('should replace template for existing conditional template of the same type', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: ['standard', 'accessible'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: 'standard-template',
      conditionalTemplates: [
        {
          templateId: 'old-large-print',
          accessibleFormat: 'x1',
          supplierReferences: { MBA: 'old-ref' },
        },
        { templateId: 'audio-template', accessibleFormat: 'q4' },
      ],
    };

    const largePrintLetterTemplate = {
      ...LARGE_PRINT_LETTER_TEMPLATE,
      id: 'new-large-print',
      letterType: 'x1' as const,
      supplierReferences: { MBA: 'new-ref' },
    };

    const result = addConditionalTemplateToCascadeItem(
      cascadeItem,
      largePrintLetterTemplate
    );

    expect(result.conditionalTemplates).toHaveLength(2);
    expect(result.conditionalTemplates![0]).toEqual({
      accessibleFormat: 'x1',
      templateId: 'new-large-print',
      supplierReferences: { MBA: 'new-ref' },
    });
    expect(result.conditionalTemplates![1]).toEqual({
      templateId: 'audio-template',
      accessibleFormat: 'q4',
    });
  });
});

describe('addConditionalTemplateToCascade', () => {
  it('should add conditional template to cascade at specified index', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'email-template',
      },
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: 'letter-template',
      },
    ];

    const largePrintLetterTemplate = {
      ...LARGE_PRINT_LETTER_TEMPLATE,
      id: 'accessible-template',
      letterType: 'x1' as const,
      supplierReferences: { MBA: 'ref-789' },
    };

    const result = addConditionalTemplateToCascade(
      cascade,
      1,
      largePrintLetterTemplate
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(cascade[0]);
    expect(result[1].conditionalTemplates).toHaveLength(1);
    expect(result[1].conditionalTemplates![0]).toEqual({
      accessibleFormat: 'x1',
      templateId: 'accessible-template',
      supplierReferences: { MBA: 'ref-789' },
    });
  });

  it('should not mutate original cascade', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: 'letter-template',
      },
    ];

    const largePrintTemplate = {
      ...LARGE_PRINT_LETTER_TEMPLATE,
      id: 'accessible-template',
      letterType: 'x1' as const,
    };

    addConditionalTemplateToCascade(cascade, 0, largePrintTemplate);

    expect(cascade[0].conditionalTemplates).toBeUndefined();
  });

  it('should work with cascade item that has existing conditionals', () => {
    const cascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard', 'accessible'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: 'letter-template',
        conditionalTemplates: [
          { templateId: 'existing', accessibleFormat: 'q4' },
        ],
      },
    ];

    const largePrintTemplate = {
      ...LARGE_PRINT_LETTER_TEMPLATE,
      id: 'new-template',
      letterType: 'x1' as const,
    };

    const result = addConditionalTemplateToCascade(
      cascade,
      0,
      largePrintTemplate
    );
    expect(result[0].conditionalTemplates).toHaveLength(2);
    expect(result[0].conditionalTemplates![1].templateId).toEqual(
      'new-template'
    );
  });
});
