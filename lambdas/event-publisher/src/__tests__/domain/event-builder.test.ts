import { VERSION } from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { EventBuilder } from '../../domain/event-builder';
import type { PublishableEventRecord } from '../../domain/input-schemas';
import { shouldPublish } from '../../domain/should-publish';

jest.mock('../../domain/should-publish');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

beforeEach(() => {
  jest.resetAllMocks();
  shouldPublishMock.mockReturnValueOnce(true);
});

const shouldPublishMock = jest.mocked(shouldPublish);

const { logger: mockLogger } = createMockLogger();

const tables = {
  templates: 'templates-table',
  routing: 'routing-config-table',
};

const eventBuilder = new EventBuilder(
  tables.templates,
  tables.routing,
  'event-source',
  mockLogger
);

const publishableTemplateEventRecord = (
  newStatus: string
): PublishableEventRecord => ({
  dynamodb: {
    SequenceNumber: '4',
    NewImage: {
      owner: {
        S: 'owner',
      },
      id: {
        S: '92b676e9-470f-4d04-ab14-965ef145e15d',
      },
      clientId: {
        S: 'client-id',
      },
      createdAt: {
        S: '2022-01-01T09:00:00.000Z',
      },
      createdBy: {
        S: 'created-by',
      },
      name: {
        S: 'name',
      },
      templateStatus: {
        S: newStatus,
      },
      updatedAt: {
        S: '2022-01-01T09:00:01.000Z',
      },
      updatedBy: {
        S: 'updated-by',
      },
      templateType: {
        S: 'LETTER',
      },
      language: {
        S: 'fr',
      },
      letterType: {
        S: 'x0',
      },
      proofingEnabled: {
        BOOL: true,
      },
      files: {
        M: {
          pdfTemplate: {
            M: {
              currentVersion: {
                S: 'current-version',
              },
              fileName: {
                S: 'file-name',
              },
              virusScanStatus: {
                S: 'PASSED',
              },
            },
          },
          proofs: {
            M: {
              proof1: {
                M: {
                  supplier: {
                    S: 'WTMMOCK',
                  },
                  fileName: {
                    S: 'file-name',
                  },
                  virusScanStatus: {
                    S: 'PASSED',
                  },
                },
              },
            },
          },
        },
      },
      personalisationParameters: {
        L: [
          {
            S: 'test',
          },
        ],
      },
    },
    OldImage: {
      owner: {
        S: 'owner',
      },
      id: {
        S: 'id',
      },
      clientId: {
        S: 'client-id',
      },
      createdAt: {
        S: '2022-01-01T09:00:00.000Z',
      },
      createdBy: {
        S: 'created-by',
      },
      name: {
        S: 'name',
      },
      templateStatus: {
        S: 'PENDING_PROOF_REQUEST',
      },
      updatedAt: {
        S: '2022-01-01T09:00:01.000Z',
      },
      updatedBy: {
        S: 'updated-by',
      },
      templateType: {
        S: 'LETTER',
      },
      language: {
        S: 'fr',
      },
      letterType: {
        S: 'x0',
      },
      proofingEnabled: {
        BOOL: true,
      },
      files: {
        M: {
          pdfTemplate: {
            M: {
              currentVersion: {
                S: 'current-version',
              },
              fileName: {
                S: 'file-name',
              },
              virusScanStatus: {
                S: 'PASSED',
              },
            },
          },
          proofs: {
            M: {
              proof1: {
                M: {
                  supplier: {
                    S: 'WTMMOCK',
                  },
                  fileName: {
                    S: 'file-name',
                  },
                  virusScanStatus: {
                    S: 'PASSED',
                  },
                },
              },
            },
          },
        },
      },
      personalisationParameters: {
        L: [
          {
            S: 'test',
          },
        ],
      },
    },
  },
  eventID: '7f2ae4b0-82c2-4911-9b84-8997d7f3f40d',
  tableName: tables.templates,
});

const expectedTemplateEvent = (
  status: string,
  type: string,
  dataschema: string
) => ({
  id: '7f2ae4b0-82c2-4911-9b84-8997d7f3f40d',
  datacontenttype: 'application/json',
  time: '2022-01-01T09:00:00.000Z',
  source: 'event-source',
  type,
  specversion: '1.0',
  dataschema,
  dataschemaversion: VERSION,
  plane: 'control',
  subject: '92b676e9-470f-4d04-ab14-965ef145e15d',
  data: {
    owner: 'owner',
    id: '92b676e9-470f-4d04-ab14-965ef145e15d',
    clientId: 'client-id',
    createdAt: '2022-01-01T09:00:00.000Z',
    createdBy: 'created-by',
    updatedAt: '2022-01-01T09:00:01.000Z',
    updatedBy: 'updated-by',
    personalisationParameters: ['test'],
    templateType: 'LETTER',
    templateStatus: status,
    name: 'name',
    letterType: 'x0',
    language: 'fr',
    files: {
      proofs: {
        proof1: {
          supplier: 'WTMMOCK',
        },
      },
    },
  },
});

const publishableRoutingConfigEventRecord = (status: string, nullTemplateIds = false) => ({
  dynamodb: {
    SequenceNumber: '4',
    NewImage: {
      owner: {
        S: 'owner',
      },
      id: {
        S: '92b676e9-470f-4d04-ab14-965ef145e15d',
      },
      clientId: {
        S: 'client-id',
      },
      campaignId: {
        S: 'campaign-id',
      },
      createdAt: {
        S: '2022-01-01T09:00:00.000Z',
      },
      name: {
        S: 'routing-config-name',
      },
      defaultCascadeGroup: {
        S: 'standard',
      },
      cascade: {
        L: [
          {
            M: {
              channel: { S: 'EMAIL' },
              channelType: { S: 'primary' },
              defaultTemplateId: nullTemplateIds ? { NULL: true } : { S: 'bed3398c-bbe3-435d-80c1-58154d4bf7dd' },
              cascadeGroups: { L: [{ S: 'standard' }] },
            },
          },
          {
            M: {
              channel: { S: 'LETTER' },
              channelType: { S: 'primary' },
              defaultTemplateId: nullTemplateIds ? { NULL: true } : { S: 'd290f1ee-6c54-4b01-90e6-d701748f0851' },
              cascadeGroups: { L: [{ S: 'standard' }] },
            },
          },
          {
            M: {
              channel: { S: 'LETTER' },
              channelType: { S: 'primary' },
              defaultTemplateId: nullTemplateIds ? { NULL: true } : { S: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
              cascadeGroups: { L: [{ S: 'translations' }] },
            },
          },
        ],
      },
      cascadeGroupOverrides: {
        L: [
          {
            M: {
              name: { S: 'translations' },
              language: { L: [{ S: 'fr' }] },
            },
          },
        ],
      },
      status: {
        S: status,
      },
    },
  },
  eventID: '7f2ae4b0-82c2-4911-9b84-8997d7f3f40d',
  tableName: tables.routing,
});

const expectedRoutingConfigEvent = (
  status: string,
  type: string,
  dataschema: string,
  nullTemplateIds = false,
) => ({
  id: '7f2ae4b0-82c2-4911-9b84-8997d7f3f40d',
  datacontenttype: 'application/json',
  time: '2022-01-01T09:00:00.000Z',
  source: 'event-source',
  type,
  specversion: '1.0',
  dataschema,
  dataschemaversion: VERSION,
  plane: 'control',
  subject: '92b676e9-470f-4d04-ab14-965ef145e15d',
  data: {
    id: '92b676e9-470f-4d04-ab14-965ef145e15d',
    clientId: 'client-id',
    campaignId: 'campaign-id',
    createdAt: '2022-01-01T09:00:00.000Z',
    name: 'routing-config-name',
    defaultCascadeGroup: 'standard',
    cascade: [
      {
        channel: 'EMAIL',
        channelType: 'primary',
        cascadeGroups: ['standard'],
        defaultTemplateId: nullTemplateIds ? null : 'bed3398c-bbe3-435d-80c1-58154d4bf7dd',
      },
      {
        channel: 'LETTER',
        channelType: 'primary',
        cascadeGroups: ['standard'],
        defaultTemplateId: nullTemplateIds ? null : 'd290f1ee-6c54-4b01-90e6-d701748f0851',
      },
      {
        channel: 'LETTER',
        channelType: 'primary',
        cascadeGroups: ['translations'],
        defaultTemplateId: nullTemplateIds ? null : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    ],
    cascadeGroupOverrides: [
      {
        name: 'translations',
        language: ['fr'],
      },
    ],
    status,
  },
});

test('errors on unrecognised event table source', () => {
  const invalidpublishableTemplateEventRecord = {
    ...publishableTemplateEventRecord('SUBMITTED'),
    tableName: 'unknown-table-name',
  };

  expect(() =>
    eventBuilder.buildEvent(invalidpublishableTemplateEventRecord)
  ).toThrow('Unrecognised event type');
});

describe('template events', () => {
  test('errors on output schema validation failure', () => {
    const valid = publishableTemplateEventRecord('SUBMITTED');

    const invalidDomainEventRecord = {
      ...valid,
      dynamodb: {
        ...valid.dynamodb,
        NewImage: {
          ...valid.dynamodb.NewImage,
          language: { N: 0 },
        },
      },
    };

    expect(() =>
      eventBuilder.buildEvent(
        invalidDomainEventRecord as unknown as PublishableEventRecord
      )
    ).toThrow(
      expect.objectContaining({
        name: 'ZodError',
        issues: [
          expect.objectContaining({
            code: 'invalid_value',
            path: ['data', 'language'],
          }),
        ],
      })
    );
  });

  test('builds template completed event', () => {
    const event = eventBuilder.buildEvent(
      publishableTemplateEventRecord('SUBMITTED')
    );

    expect(event).toEqual(
      expectedTemplateEvent(
        'SUBMITTED',
        'uk.nhs.notify.template-management.TemplateCompleted.v1',
        'https://notify.nhs.uk/events/schemas/TemplateCompleted/v1.json'
      )
    );
  });

  test('builds template drafted event', () => {
    const event = eventBuilder.buildEvent(
      publishableTemplateEventRecord('PROOF_AVAILABLE')
    );

    expect(event).toEqual(
      expectedTemplateEvent(
        'PROOF_AVAILABLE',
        'uk.nhs.notify.template-management.TemplateDrafted.v1',
        'https://notify.nhs.uk/events/schemas/TemplateDrafted/v1.json'
      )
    );
  });

  test('builds event when no old image is available', () => {
    // although not required by this lambda, an old image would be expected here in real usage
    const mockEvent = publishableTemplateEventRecord('SUBMITTED');

    const noOldImage = {
      ...mockEvent,
      dynamodb: {
        SequenceNumber: mockEvent.dynamodb.SequenceNumber,
        NewImage: mockEvent.dynamodb.NewImage,
      },
    };

    const event = eventBuilder.buildEvent(noOldImage);

    expect(event).toEqual(
      expectedTemplateEvent(
        'SUBMITTED',
        'uk.nhs.notify.template-management.TemplateCompleted.v1',
        'https://notify.nhs.uk/events/schemas/TemplateCompleted/v1.json'
      )
    );
  });

  test('builds template deleted event', () => {
    const event = eventBuilder.buildEvent(
      publishableTemplateEventRecord('DELETED')
    );

    expect(event).toEqual(
      expectedTemplateEvent(
        'DELETED',
        'uk.nhs.notify.template-management.TemplateDeleted.v1',
        'https://notify.nhs.uk/events/schemas/TemplateDeleted/v1.json'
      )
    );
  });

  test('should return undefined when not a publishable event', () => {
    shouldPublishMock.mockReset();
    shouldPublishMock.mockReturnValueOnce(false);

    const event = eventBuilder.buildEvent(
      publishableTemplateEventRecord('PROOF_AVAILABLE')
    );

    expect(event).toEqual(undefined);
  });

  test('does not build template event on hard delete', () => {
    const hardDeletePublishableTemplateEventRecord = {
      ...publishableTemplateEventRecord('SUBMITTED'),
      dynamodb: {
        SequenceNumber: '4',
        NewImage: undefined,
      },
    };

    const event = eventBuilder.buildEvent(
      hardDeletePublishableTemplateEventRecord
    );

    expect(event).toEqual(undefined);
  });
});

describe('routing config events', () => {
  test('errors on output schema validation failure', () => {
    const valid = publishableRoutingConfigEventRecord('DRAFT');

    const invalidDomainEventRecord = {
      ...valid,
      dynamodb: {
        ...valid.dynamodb,
        NewImage: {
          ...valid.dynamodb.NewImage,
          cascade: {
            L: [
              {
                M: {
                  channel: { S: 'EMAIL' },
                  channelType: { S: 'primary' },
                  defaultTemplateId: { S: 52 },
                  cascadeGroups: { L: [{ S: 'standard' }] },
                },
              },
            ],
          },
        },
      },
    };

    const event = eventBuilder.buildEvent(
      invalidDomainEventRecord as unknown as PublishableEventRecord
    );

    expect(event).toEqual(undefined);
  });

  test('does not build routing config completed event with null template IDs', () => {
    const event = eventBuilder.buildEvent(
      publishableRoutingConfigEventRecord('COMPLETED', true)
    );

    expect(event).toEqual(undefined);
  });

  test('builds routing config completed event', () => {
    const event = eventBuilder.buildEvent(
      publishableRoutingConfigEventRecord('COMPLETED')
    );

    expect(event).toEqual(
      expectedRoutingConfigEvent(
        'COMPLETED',
        'uk.nhs.notify.template-management.RoutingConfigCompleted.v1',
        'https://notify.nhs.uk/events/schemas/RoutingConfigCompleted/v1.json',
      )
    );
  });

  test('builds routing config drafted event with null template IDs', () => {
    const event = eventBuilder.buildEvent(
      publishableRoutingConfigEventRecord('DRAFT', true)
    );

    expect(event).toEqual(
      expectedRoutingConfigEvent(
        'DRAFT',
        'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
        'https://notify.nhs.uk/events/schemas/RoutingConfigDrafted/v1.json',
        true,
      )
    );
  });

  test('builds routing config drafted event', () => {
    const event = eventBuilder.buildEvent(
      publishableRoutingConfigEventRecord('DRAFT')
    );

    expect(event).toEqual(
      expectedRoutingConfigEvent(
        'DRAFT',
        'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
        'https://notify.nhs.uk/events/schemas/RoutingConfigDrafted/v1.json'
      )
    );
  });

  test('builds routing config deleted event', () => {
    const event = eventBuilder.buildEvent(
      publishableRoutingConfigEventRecord('DELETED')
    );

    expect(event).toEqual(
      expectedRoutingConfigEvent(
        'DELETED',
        'uk.nhs.notify.template-management.RoutingConfigDeleted.v1',
        'https://notify.nhs.uk/events/schemas/RoutingConfigDeleted/v1.json'
      )
    );
  });

  test('does not build routing config event on hard delete', () => {
    const hardDeletePublishableRoutingConfigEventRecord = {
      ...publishableRoutingConfigEventRecord('DRAFT'),
      dynamodb: {
        SequenceNumber: '4',
        NewImage: undefined,
      },
    };

    const event = eventBuilder.buildEvent(
      hardDeletePublishableRoutingConfigEventRecord
    );

    expect(event).toEqual(undefined);
  });
});
