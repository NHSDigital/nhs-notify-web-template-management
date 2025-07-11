import { mockDeep } from 'jest-mock-extended';
import { EventBuilder } from '../../domain/event-builder';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { PublishableEventRecord } from '../../domain/input-schemas';
import { Event } from '../../domain/output-schemas';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

const mockLogger = mockDeep<Logger>();

const eventBuilder = new EventBuilder('table-name', 'event-source', mockLogger);

const publishableEventRecord: PublishableEventRecord = {
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
        S: 'SUBMITTED',
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
    },
  },
  eventID: 'event-id',
  tableName: 'table-name',
};

const expectedEvent: Event = {
  id: 'event-id',
  datacontenttype: 'application/json',
  time: '2022-01-01T09:00:00.000Z',
  sequence: '4',
  source: 'event-source',
  type: 'uk.nhs.notify.template-management.TemplateSaved.v1',
  specversion: '1.0',
  data: {
    owner: 'owner',
    id: 'id',
    clientId: 'client-id',
    createdAt: 'created-at',
    createdBy: 'created-by',
    updatedAt: 'updated-at',
    updatedBy: 'updated-by',
    templateType: 'LETTER',
    templateStatus: 'SUBMITTED',
    name: 'name',
    letterType: 'x0',
    language: 'fr',
    suppliers: ['WTMMOCK'],
  },
};

test('errors on unrecognised event type', () => {
  const invalidPublishableEventRecord = {
    ...publishableEventRecord,
    tableName: 'not-table-name',
  };

  expect(() => eventBuilder.buildEvent(invalidPublishableEventRecord)).toThrow(
    'Unrecognised event type'
  );
});

test('builds template submitted event', () => {
  const event = eventBuilder.buildEvent(publishableEventRecord);

  expect(event).toEqual(expectedEvent);
});

test('does not build template submitted event on hard delete', () => {
  const hardDeletePublishableEventRecord = {
    ...publishableEventRecord,
    dynamodb: {
      SequenceNumber: '4',
      NewImage: undefined,
    },
  };

  const event = eventBuilder.buildEvent(hardDeletePublishableEventRecord);

  expect(event).toEqual(undefined);
});
