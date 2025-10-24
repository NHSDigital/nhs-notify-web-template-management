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

const expectedEvent = (status: string, type: string, dataschema: string) => ({
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
      expectedEvent(
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
      expectedEvent(
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
      expectedEvent(
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
      expectedEvent(
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
    const hardDeletepublishableTemplateEventRecord = {
      ...publishableTemplateEventRecord('SUBMITTED'),
      dynamodb: {
        SequenceNumber: '4',
        NewImage: undefined,
      },
    };

    const event = eventBuilder.buildEvent(
      hardDeletepublishableTemplateEventRecord
    );

    expect(event).toEqual(undefined);
  });
});

describe('routing config events', () => {
  test('should return undefined when table source is routing config table', () => {
    const event = eventBuilder.buildEvent({
      dynamodb: {
        SequenceNumber: '1',
        NewImage: {},
        OldImage: {},
      },
      eventID: 'cf1344e0-fd57-426a-860a-3efc9d2b1977',
      tableName: tables.routing,
    });

    expect(event).toEqual(undefined);
  });
});
