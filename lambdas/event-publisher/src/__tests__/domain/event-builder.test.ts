import { mockDeep } from 'jest-mock-extended';
import { EventBuilder } from '../../domain/event-builder';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
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

const mockLogger = mockDeep<Logger>();

const eventBuilder = new EventBuilder('table-name', 'event-source', mockLogger);

const publishableEventRecord = (status: string): PublishableEventRecord => ({
  dynamodb: {
    SequenceNumber: '4',
    NewImage: {
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
        S: status,
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
  eventID: 'event-id',
  tableName: 'table-name',
});

const expectedEvent = (status: string, type: string, dataschema: string) => ({
  id: 'event-id',
  datacontenttype: 'application/json',
  time: '2022-01-01T09:00:00.000Z',
  source: 'event-source',
  type,
  specversion: '1.0',
  dataschema,
  dataschemaversion: '1.0.0',
  plane: 'control',
  subject: 'id',
  data: {
    owner: 'owner',
    id: 'id',
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
