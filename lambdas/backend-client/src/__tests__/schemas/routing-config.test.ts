import {
  $RoutingConfig,
  $ListRoutingConfigFilters,
} from '../../schemas/routing-config';

describe('RoutingConfig schema', () => {
  const base = {
    campaignId: 'campaign-1',
    clientId: 'client-1',
    cascade: [
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
      },
    ],
    cascadeGroupOverrides: [
      { name: 'standard' },
      { name: 'translations', language: ['ar', 'zh'] },
      { name: 'accessible', accessibleFormat: ['x1', 'x0'] },
    ],
    id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
    owner: 'client-1',
    status: 'DRAFT',
    name: 'Test config',
    createdAt: '2025-09-18T15:26:04.338Z',
    createdBy: 'user-1',
    updatedAt: '2025-09-18T15:26:04.338Z',
    updatedBy: 'user-1',
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

  test('valid minimal with defaultTemplateId cascade item', () => {
    const res = $RoutingConfig.safeParse(base);
    expect(res.success).toBe(true);
  });

  test('valid with translations conditional cascade item', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascade: [cascadeCondLang],
    });
    expect(res.success).toBe(true);
  });

  test('valid with accessible conditional cascade item', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascade: [cascadeCondAcc],
    });
    expect(res.success).toBe(true);
  });

  test('snapshot full error', () => {
    const res = $RoutingConfig.safeParse({});

    expect(res.success).toBe(false);

    expect(res.error).toMatchSnapshot();
  });

  test('cascade must be nonempty', () => {
    const res = $RoutingConfig.safeParse({ ...base, cascade: [] });
    expect(res.success).toBe(false);
  });

  test('cascadeGroupOverrides must be nonempty', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [],
    });
    expect(res.success).toBe(false);
  });

  test('translations override languages must be nonempty', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [{ name: 'translations', language: [] }],
    });
    expect(res.success).toBe(false);
  });

  test('accessible override accessibleFormat must be nonempty', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [{ name: 'accessible', accessibleFormat: [] }],
    });
    expect(res.success).toBe(false);
  });

  test('accessible cascade group must does accept "language"', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [
        { name: 'accessible', accessibleFormat: ['x1'], language: ['ar'] },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('translations cascade group does not accept "accessibleFormat"', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [
        { name: 'translations', language: ['ar'], accessibleFormat: ['x1'] },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('standard cascade group does not accept extra keys', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [{ name: 'standard', foo: 'bar' }],
    });
    expect(res.success).toBe(false);
  });

  test('CascadeItem with both defaultTemplateId and conditionalTemplates is invalid', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascade: [
        {
          ...cascadeCondLang,
          defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
          cascadeGroups: ['standard', 'translations'],
        },
      ],
    });
    expect(res.success).toBe(false);
  });

  test('CascadeItem missing both defaultTemplateId and conditionalTemplates is invalid', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
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

  test('invalid status', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      status: 'INVALID_STATUS',
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade channel', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
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
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [{ name: 'translations', language: ['xx'] }],
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade group accessible format', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
      cascadeGroupOverrides: [{ name: 'accessible', accessibleFormat: ['xx'] }],
    });
    expect(res.success).toBe(false);
  });

  test('invalid cascade conditional language', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
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
    const res = $RoutingConfig.safeParse({
      ...base,
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

  test('invalid if id not a uuid', () => {
    const res = $RoutingConfig.safeParse({
      ...base,
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
