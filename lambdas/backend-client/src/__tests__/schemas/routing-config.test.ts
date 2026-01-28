import {
  $CreateRoutingConfig,
  $ListRoutingConfigFilters,
  $RoutingConfig,
  $UpdateRoutingConfig,
  $SubmittableCascade,
  $SubmittableCascadeItem,
} from '../../schemas/routing-config';

const cascadeItemDefault = {
  cascadeGroups: ['standard'],
  channel: 'LETTER',
  channelType: 'primary',
  defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
};

const baseInput = {
  campaignId: 'campaign-1',
  cascade: [cascadeItemDefault],
  cascadeGroupOverrides: [
    { name: 'standard' },
    { name: 'translations', language: ['ar', 'zh'] },
    { name: 'accessible', accessibleFormat: ['x1', 'x0'] },
  ],
  name: 'Test config',
};

const cascadeCondLang = {
  cascadeGroups: ['translations'],
  channel: 'LETTER',
  channelType: 'secondary',
  conditionalTemplates: [
    { language: 'ar', templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09' },
  ],
};

const cascadeCondAcc = {
  cascadeGroups: ['accessible'],
  channel: 'LETTER',
  channelType: 'secondary',
  conditionalTemplates: [
    {
      accessibleFormat: 'x1',
      templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
    },
  ],
};

const baseCreated = {
  ...baseInput,
  clientId: 'client-1',
  id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
  owner: 'CLIENT#client-1',
  status: 'DRAFT',
  createdAt: '2025-09-18T15:26:04.338Z',
  createdBy: 'user-1',
  updatedAt: '2025-09-18T15:26:04.338Z',
  updatedBy: 'user-1',
  defaultCascadeGroup: 'standard',
};

describe.each([
  ['CreateRoutingConfig', $CreateRoutingConfig],
  ['UpdateRoutingConfig', $UpdateRoutingConfig],
])('Create/Update - %s schema', (_, $Schema) => {
  test('valid minimal with defaultTemplateId cascade item', () => {
    const res = $Schema.safeParse(baseInput);
    expect(res.success).toBe(true);
  });

  test('valid with defaultTemplateId set to null', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [{ ...cascadeItemDefault, defaultTemplateId: null }],
    });
    expect(res.success).toBe(true);
  });

  test('valid with translations conditional cascade item', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [cascadeCondLang],
    });
    expect(res.success).toBe(true);
  });

  test('valid with accessible conditional cascade item', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [cascadeCondAcc],
    });
    expect(res.success).toBe(true);
  });

  test('snapshot full error', () => {
    const res = $Schema.safeParse({});

    expect(res.success).toBe(false);

    expect(res.error).toMatchSnapshot();
  });

  test('cascade must be nonempty', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [],
    });
    expect(res.success).toBe(false);
  });

  test('defaultTemplateId cannot be empty string', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [{ ...cascadeItemDefault, defaultTemplateId: '' }],
    });
    expect(res.success).toBe(false);
  });

  test('conditional language template ids cannot be empty string', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [
        {
          ...cascadeCondLang,
          conditionalTemplates: [
            {
              language: 'ar',
              templateId: '',
            },
          ],
        },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('conditional accessible template ids cannot be empty string', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [
        {
          ...cascadeCondAcc,
          conditionalTemplates: [
            {
              accessibleFormat: 'x1',
              templateId: '',
            },
          ],
        },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('translations override languages must be nonempty', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascadeGroupOverrides: [{ name: 'translations', language: [] }],
    });
    expect(res.success).toBe(false);
  });

  test('accessible override accessibleFormat must be nonempty', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascadeGroupOverrides: [{ name: 'accessible', accessibleFormat: [] }],
    });
    expect(res.success).toBe(false);
  });

  test('accessible cascade group does not accept "language"', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascadeGroupOverrides: [
        { name: 'accessible', accessibleFormat: ['x1'], language: ['ar'] },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('translations cascade group does not accept "accessibleFormat"', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascadeGroupOverrides: [
        { name: 'translations', language: ['ar'], accessibleFormat: ['x1'] },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('standard cascade group does not accept extra keys', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascadeGroupOverrides: [{ name: 'standard', foo: 'bar' }],
    });
    expect(res.success).toBe(false);
  });

  test('CascadeItem with both defaultTemplateId and conditionalTemplates is valid', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [
        {
          ...cascadeCondLang,
          defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
          cascadeGroups: ['standard', 'translations'],
        },
      ],
    });
    expect(res.success).toBe(true);
  });

  test('CascadeItem missing both defaultTemplateId and conditionalTemplates is invalid', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
        },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade channel', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'INVALID_CHANNEL',
          channelType: 'primary',
          defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
        },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade group language', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascadeGroupOverrides: [{ name: 'translations', language: ['xx'] }],
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade group accessible format', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascadeGroupOverrides: [{ name: 'accessible', accessibleFormat: ['xx'] }],
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade conditional language', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [
        {
          cascadeGroups: ['translations'],
          channel: 'LETTER',
          channelType: 'secondary',
          conditionalTemplates: [
            {
              language: 'xx',
              templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
            },
          ],
        },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade conditional accessible format', () => {
    const res = $Schema.safeParse({
      ...baseInput,
      cascade: [
        {
          cascadeGroups: ['accessible'],
          channel: 'LETTER',
          channelType: 'secondary',
          conditionalTemplates: [
            {
              accessibleFormat: 'xx',
              templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
            },
          ],
        },
      ],
    });
    expect(res.success).toBe(false);
  });
});

describe('RoutingConfig schema', () => {
  test('valid minimal', () => {
    const res = $RoutingConfig.safeParse(baseCreated);
    expect(res.success).toBe(true);
  });

  test('snapshot full error', () => {
    const res = $RoutingConfig.safeParse({});

    expect(res.success).toBe(false);

    expect(res.error).toMatchSnapshot();
  });

  test('invalid status', () => {
    const res = $RoutingConfig.safeParse({
      ...baseCreated,
      status: 'INVALID_STATUS',
    });
    expect(res.success).toBe(false);
  });

  test('invalid if id not a uuid', () => {
    const res = $RoutingConfig.safeParse({
      ...baseCreated,
      id: 'not-a-uuid',
    });
    expect(res.success).toBe(false);
  });
});

describe('ListRoutingConfigFilters', () => {
  test('accepts empty object', () => {
    const res = $ListRoutingConfigFilters.safeParse({});
    expect(res.success).toBe(true);
  });
  test('accepts DRAFT status', () => {
    const res = $ListRoutingConfigFilters.safeParse({ status: 'DRAFT' });
    expect(res.success).toBe(true);
  });
  test('accepts COMPLETED status', () => {
    const res = $ListRoutingConfigFilters.safeParse({ status: 'COMPLETED' });
    expect(res.success).toBe(true);
  });
  test('rejects other statuses', () => {
    const res = $ListRoutingConfigFilters.safeParse({ status: 'DELETED' });
    expect(res.success).toBe(false);
  });
});

describe('UpdateRoutingConfig', () => {
  test('accepts payload without a name', () => {
    const { name, ...rest } = baseInput;

    const res = $UpdateRoutingConfig.safeParse(rest);

    expect(res.success).toBe(true);
  });

  test('accepts payload without a campaignId', () => {
    const { campaignId, ...rest } = baseInput;

    const res = $UpdateRoutingConfig.safeParse(rest);

    expect(res.success).toBe(true);
  });

  test('accepts payload without a cascade and cascadeGroupOverrides', () => {
    const { cascade, cascadeGroupOverrides, ...rest } = baseInput;

    const res = $UpdateRoutingConfig.safeParse(rest);

    expect(res.success).toBe(true);
  });

  test('invalid with cascadeGroupOverrides and without cascade', () => {
    const { cascade, ...rest } = baseInput;

    const res = $UpdateRoutingConfig.safeParse(rest);

    expect(res.success).toBe(false);

    expect(res.error).toMatchSnapshot();
  });

  test('invalid with cascade but without cascadeGroupOverrides', () => {
    const { cascadeGroupOverrides, ...rest } = baseInput;

    const res = $UpdateRoutingConfig.safeParse(rest);

    expect(res.success).toBe(false);

    expect(res.error).toMatchSnapshot();
  });
});

describe('$SubmittableCascadeItem', () => {
  test('valid with defaultTemplateId', () => {
    const res = $SubmittableCascadeItem.safeParse({
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
    });
    expect(res.success).toBe(true);
  });

  test('valid with defaultTemplateId and conditionalTemplates', () => {
    const res = $SubmittableCascadeItem.safeParse({
      cascadeGroups: ['standard', 'translations'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
      conditionalTemplates: [
        { language: 'ar', templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09' },
      ],
    });
    expect(res.success).toBe(true);
  });

  test('valid with conditionalTemplates only (non-empty)', () => {
    const res = $SubmittableCascadeItem.safeParse({
      cascadeGroups: ['translations'],
      channel: 'LETTER',
      channelType: 'secondary',
      conditionalTemplates: [
        { language: 'ar', templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09' },
      ],
    });
    expect(res.success).toBe(true);
  });

  test('valid with accessible conditional templates only', () => {
    const res = $SubmittableCascadeItem.safeParse({
      cascadeGroups: ['accessible'],
      channel: 'LETTER',
      channelType: 'secondary',
      conditionalTemplates: [
        {
          accessibleFormat: 'x1',
          templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
        },
      ],
    });
    expect(res.success).toBe(true);
  });

  test('invalid without defaultTemplateId and without conditionalTemplates', () => {
    const res = $SubmittableCascadeItem.safeParse({
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
    });
    expect(res.success).toBe(false);
  });

  test('invalid with empty conditionalTemplates and no defaultTemplateId', () => {
    const res = $SubmittableCascadeItem.safeParse({
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      conditionalTemplates: [],
    });
    expect(res.success).toBe(false);
  });

  test('invalid with empty defaultTemplateId', () => {
    const res = $SubmittableCascadeItem.safeParse({
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: '',
    });
    expect(res.success).toBe(false);
  });
});

describe('$SubmittableCascade', () => {
  const validCascadeItem = {
    cascadeGroups: ['standard'],
    channel: 'LETTER',
    channelType: 'primary',
    defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
  };

  test('valid with single item', () => {
    const res = $SubmittableCascade.safeParse([validCascadeItem]);
    expect(res.success).toBe(true);
  });

  test('valid with multiple items', () => {
    const res = $SubmittableCascade.safeParse([
      validCascadeItem,
      {
        cascadeGroups: ['translations'],
        channel: 'EMAIL',
        channelType: 'secondary',
        conditionalTemplates: [
          {
            language: 'ar',
            templateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
          },
        ],
      },
    ]);
    expect(res.success).toBe(true);
  });

  test('invalid with empty array', () => {
    const res = $SubmittableCascade.safeParse([]);
    expect(res.success).toBe(false);
  });

  test('invalid with invalid cascade item in array', () => {
    const res = $SubmittableCascade.safeParse([
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
      },
    ]);
    expect(res.success).toBe(false);
  });
});
