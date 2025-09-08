import { EventBuilder } from '../../domain/event-builder';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { PublishableEventRecord } from '../../domain/input-schemas';
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

const eventBuilder = new EventBuilder('table-name', 'event-source', mockLogger);

const publishableEventRecord = (newStatus: string): PublishableEventRecord => ({
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
        S: 'created-at',
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
        S: 'updated-at',
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
        S: 'created-at',
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
        S: 'updated-at',
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
  tableName: 'table-name',
});

const expectedEvent = (status: string, type: string, dataschema: string) => ({
  id: '7f2ae4b0-82c2-4911-9b84-8997d7f3f40d',
  datacontenttype: 'application/json',
  time: '2022-01-01T09:00:00.000Z',
  source: 'event-source',
  type,
  specversion: '1.0',
  dataschema,
  dataschemaversion: '1.1.0',
  plane: 'control',
  subject: '92b676e9-470f-4d04-ab14-965ef145e15d',
  data: {
    owner: 'owner',
    id: '92b676e9-470f-4d04-ab14-965ef145e15d',
    clientId: 'client-id',
    createdAt: 'created-at',
    createdBy: 'created-by',
    updatedAt: 'updated-at',
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

test('errors on unrecognised event type', () => {
  const invalidPublishableEventRecord = {
    ...publishableEventRecord('SUBMITTED'),
    tableName: 'not-table-name',
  };

  expect(() => eventBuilder.buildEvent(invalidPublishableEventRecord)).toThrow(
    'Unrecognised event type'
  );
});

test('errors on output schema validation failure', () => {
  const valid = publishableEventRecord('SUBMITTED');

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
  const event = eventBuilder.buildEvent(publishableEventRecord('SUBMITTED'));

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
    publishableEventRecord('PROOF_AVAILABLE')
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
  const mockEvent = publishableEventRecord('SUBMITTED');

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
  const event = eventBuilder.buildEvent(publishableEventRecord('DELETED'));

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
    publishableEventRecord('PROOF_AVAILABLE')
  );

  expect(event).toEqual(undefined);
});

test('does not build template event on hard delete', () => {
  const hardDeletePublishableEventRecord = {
    ...publishableEventRecord('SUBMITTED'),
    dynamodb: {
      SequenceNumber: '4',
      NewImage: undefined,
    },
  };

  const event = eventBuilder.buildEvent(hardDeletePublishableEventRecord);

  expect(event).toEqual(undefined);
});
