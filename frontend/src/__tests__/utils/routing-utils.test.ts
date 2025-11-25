import {
  getMessagePlanTemplateIds,
  shouldRemoveTemplate,
  removeTemplatesFromConditionalTemplates,
  removeTemplatesFromCascadeItem,
  getRemainingAccessibleFormats,
  getRemainingLanguages,
  updateCascadeGroupOverrides,
  buildCascadeGroupsForItem,
  getConditionalTemplatesForItem,
  type ConditionalTemplate,
  type MessagePlanTemplates,
} from '@utils/routing-utils';
import type {
  CascadeItem,
  Language,
  LetterType,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-backend-client';

const baseConfig: RoutingConfig = {
  id: 'test-id',
  name: 'Test message plan',
  status: 'DRAFT',
  clientId: 'client-1',
  campaignId: 'campaign-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  cascade: [],
  cascadeGroupOverrides: [{ name: 'standard' }],
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

describe('updateCascadeGroupOverrides', () => {
  it('should update accessible group with remaining formats', () => {
    const cascadeGroupOverrides = [
      {
        name: 'accessible' as const,
        accessibleFormat: ['q4', 'x0', 'x1'] as LetterType[],
      },
      { name: 'standard' as const },
    ];

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

    const result = updateCascadeGroupOverrides(
      cascadeGroupOverrides,
      updatedCascade
    );

    expect(result).toEqual([
      { name: 'accessible', accessibleFormat: ['q4'] },
      { name: 'standard' },
    ]);
  });

  it('should update translations group with remaining languages', () => {
    const cascadeGroupOverrides = [
      {
        name: 'translations' as const,
        language: ['fr', 'es', 'de'] as Language[],
      },
      { name: 'standard' as const },
    ];

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

    const result = updateCascadeGroupOverrides(
      cascadeGroupOverrides,
      updatedCascade
    );

    expect(result.length).toBe(2);
    expect(result[0]).toMatchObject({
      name: 'translations',
      language: ['fr', 'es'],
    });

    expect(result[1]).toEqual({ name: 'standard' });
  });

  it('should remove accessible group when no formats remain', () => {
    const cascadeGroupOverrides = [
      {
        name: 'accessible' as const,
        accessibleFormat: ['q4'] as LetterType[],
      },
      { name: 'standard' as const },
    ];

    const updatedCascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'template-1',
      },
    ];

    const result = updateCascadeGroupOverrides(
      cascadeGroupOverrides,
      updatedCascade
    );

    expect(result).toEqual([{ name: 'standard' }]);
  });

  it('should remove translations group when no languages remain', () => {
    const cascadeGroupOverrides = [
      { name: 'translations' as const, language: ['fr'] as Language[] },
      { name: 'standard' as const },
    ];

    const updatedCascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'template-1',
      },
    ];

    const result = updateCascadeGroupOverrides(
      cascadeGroupOverrides,
      updatedCascade
    );

    expect(result).toEqual([{ name: 'standard' }]);
  });

  it('should keep standard group unchanged', () => {
    const cascadeGroupOverrides = [{ name: 'standard' as const }];

    const updatedCascade: CascadeItem[] = [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: 'template-1',
      },
    ];

    const result = updateCascadeGroupOverrides(
      cascadeGroupOverrides,
      updatedCascade
    );

    expect(result).toEqual([{ name: 'standard' }]);
  });
});
