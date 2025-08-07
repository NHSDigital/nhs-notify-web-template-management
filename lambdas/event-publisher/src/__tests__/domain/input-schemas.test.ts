import {
  $DynamoDBStreamRecord,
  $DynamoDBTemplate,
  $PublishableEventRecord,
} from '../../domain/input-schemas';

describe('Input Schemas', () => {
  describe('$DynamoDBStreamRecord', () => {
    it('should validate minimal valid record', () => {
      const minimalRecord = {
        eventID: 'test-event-id',
        dynamodb: {},
        tableName: 'test-table',
      };

      expect(() => $DynamoDBStreamRecord.parse(minimalRecord)).not.toThrow();
    });

    it('should validate record with all AttributeValue types', () => {
      const recordWithAllTypes = {
        eventID: 'test-event-id',
        dynamodb: {
          NewImage: {
            stringField: { S: 'test-string' },
            numberField: { N: '123' },
            booleanField: { BOOL: true },
            nullField: { NULL: true },
            binaryField: { B: new Uint8Array([1, 2, 3]) },
            stringSetField: { SS: ['string1', 'string2'] },
            numberSetField: { NS: ['123', '456'] },
            binarySetField: {
              BS: [new Uint8Array([1, 2]), new Uint8Array([3, 4])],
            },
            listField: { L: [{ S: 'nested-string' }, { N: '789' }] },
            mapField: {
              M: {
                nestedString: { S: 'nested-value' },
                nestedNumber: { N: '999' },
              },
            },
          },
          SequenceNumber: '12345678901234567890',
        },
        tableName: 'test-table',
      };

      expect(() =>
        $DynamoDBStreamRecord.parse(recordWithAllTypes)
      ).not.toThrow();
    });
  });

  describe('$DynamoDBTemplate', () => {
    it('should validate minimal template', () => {
      const minimalTemplate = {
        id: 'template-123',
        templateType: 'EMAIL',
        templateStatus: 'SUBMITTED',
      };

      expect(() => $DynamoDBTemplate.parse(minimalTemplate)).not.toThrow();
    });

    it('should validate template with optional fields', () => {
      const templateWithProofing = {
        id: 'template-456',
        templateType: 'EMAIL',
        templateStatus: 'SUBMITTED',
        proofingEnabled: true,
      };

      expect(() => $DynamoDBTemplate.parse(templateWithProofing)).not.toThrow();
    });
  });

  describe('$PublishableEventRecord', () => {
    it('should validate publishable event record', () => {
      const record = {
        eventID: 'publishable-event-id',
        dynamodb: {
          NewImage: {
            id: { S: 'template-id-123' },
            name: { S: 'Test Template' },
          },
          SequenceNumber: '1234567890',
        },
        tableName: 'templates-table',
      };

      expect(() => $PublishableEventRecord.parse(record)).not.toThrow();
    });
  });
});
