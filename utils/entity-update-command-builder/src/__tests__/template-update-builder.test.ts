import type {
  ValidationErrorDetail,
  TemplateStatus,
} from 'nhs-notify-backend-client';
import { TemplateUpdateBuilder } from '../template-update-builder';

const mockTableName = 'TABLE_NAME';
const mockOwner = 'Hello1';
const mockOwnerKey = `CLIENT#${mockOwner}`;
const mockId = 'Hello2';
const mockDate = new Date('2025-01-01 09:00:00');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

describe('TemplateUpdateBuilder', () => {
  describe('build', () => {
    test('after initialisation returns empty update', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeNames: {},
        UpdateExpression: '',
      });
    });

    test('provide ReturnValuesOnConditionCheckFailure optional arg will modify output', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId,
        {
          ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        }
      );

      const res = builder.build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeNames: {},
        UpdateExpression: '',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      });
    });
  });

  describe('setStatus', () => {
    test('sets status field to provided TemplateStatus', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const status = 'NOT_YET_SUBMITTED';

      const res = builder.setStatus(status).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':templateStatus': status,
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });

    test('sets status field to provided TemplateStatus and creates ConditionExpression with expected value', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const value = 'DELETED';
      const expected = 'NOT_YET_SUBMITTED';

      const res = builder.setStatus(value).expectStatus(expected).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':condition_1_templateStatus': 'NOT_YET_SUBMITTED',
          ':templateStatus': value,
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        ConditionExpression: '#templateStatus = :condition_1_templateStatus',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });

    test('allows array of expected statuses to be used', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const value = 'DELETED';
      const expected: TemplateStatus[] = [
        'NOT_YET_SUBMITTED',
        'PENDING_VALIDATION',
      ];

      const res = builder.setStatus(value).expectStatus(expected).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':condition_1_1_templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_1_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': value,
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        ConditionExpression:
          '#templateStatus IN (:condition_1_1_templateStatus, :condition_1_2_templateStatus)',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });
  });

  describe('setSupplierReference', () => {
    test('sets supplier reference', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setSupplierReference('supplier', 'supplier-reference-value')
        .build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#supplierReferences': 'supplierReferences',
          '#supplier': 'supplier',
        },
        ExpressionAttributeValues: {
          ':supplier': 'supplier-reference-value',
        },
        Key: {
          id: 'Hello2',
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #supplierReferences.#supplier = :supplier',
      });
    });
  });

  describe('initialiseSupplierReferences', () => {
    test('initialises supplier references', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.initialiseSupplierReferences().build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#supplierReferences': 'supplierReferences',
        },
        ExpressionAttributeValues: {
          ':supplierReferences': {},
        },
        Key: {
          id: 'Hello2',
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression:
          'SET #supplierReferences = if_not_exists(#supplierReferences, :supplierReferences)',
      });
    });
  });

  describe('setLockTime', () => {
    test('sets lock time if no lock exists', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setLockTime('sftpSendLockTime', 500).build();

      expect(res).toEqual({
        ConditionExpression: 'attribute_not_exists (#sftpSendLockTime)',
        ExpressionAttributeNames: {
          '#sftpSendLockTime': 'sftpSendLockTime',
        },
        ExpressionAttributeValues: {
          ':sftpSendLockTime': 500,
        },
        Key: {
          id: 'Hello2',
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #sftpSendLockTime = :sftpSendLockTime',
      });
    });

    test('sets lock time if no lock exists, or if the lock has expired, when lockExpiryTimeMs is provided', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setLockTime('sftpSendLockTime', 1000, 1500).build();

      expect(res).toEqual({
        ConditionExpression:
          'attribute_not_exists (#sftpSendLockTime) OR #sftpSendLockTime > :condition_2_sftpSendLockTime',
        ExpressionAttributeNames: {
          '#sftpSendLockTime': 'sftpSendLockTime',
        },
        ExpressionAttributeValues: {
          ':condition_2_sftpSendLockTime': 1500,
          ':sftpSendLockTime': 1000,
        },
        Key: {
          id: 'Hello2',
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #sftpSendLockTime = :sftpSendLockTime',
      });
    });
  });

  describe('setLockTimeUnconditional', () => {
    test('sets lock time without conditions', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setLockTimeUnconditional('sftpSendLockTime', 1)
        .build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#sftpSendLockTime': 'sftpSendLockTime',
        },
        ExpressionAttributeValues: {
          ':sftpSendLockTime': 1,
        },
        Key: {
          id: 'Hello2',
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #sftpSendLockTime = :sftpSendLockTime',
      });
    });
  });

  describe('setUpdatedByUserAt', () => {
    test('sets updatedBy and updatedAt', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setUpdatedByUserAt('userId').build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':updatedAt': mockDate.toISOString(),
          ':updatedBy': 'userId',
        },
        Key: {
          id: mockId,
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression:
          'SET #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });
  });

  describe('expectTemplateExists', () => {
    test('asserts id attribute exists', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setStatus('NOT_YET_SUBMITTED')
        .expectTemplateExists()
        .build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':templateStatus': 'NOT_YET_SUBMITTED',
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#id': 'id',
        },
        ConditionExpression: 'attribute_exists (#id)',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });
  });

  describe('expectTemplateType', () => {
    test('adds templateType condition', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setStatus('NOT_YET_SUBMITTED')
        .expectTemplateType('SMS')
        .build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_1_templateType': 'SMS',
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
        },
        ConditionExpression: '#templateType = :condition_1_templateType',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });
  });

  describe('expectClientId', () => {
    test('adds clientId condition', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setStatus('NOT_YET_SUBMITTED')
        .expectClientId('9703B712-53ED-4E4E-8767-0E7AAC9ECC09')
        .build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_1_clientId': '9703B712-53ED-4E4E-8767-0E7AAC9ECC09',
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#clientId': 'clientId',
        },
        ConditionExpression: '#clientId = :condition_1_clientId',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });
  });

  describe('expectProofingEnabled', () => {
    test('adds proofingEnabled [true] condition', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setStatus('NOT_YET_SUBMITTED')
        .expectProofingEnabled()
        .build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_1_proofingEnabled': true,
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#proofingEnabled': 'proofingEnabled',
        },
        ConditionExpression: '#proofingEnabled = :condition_1_proofingEnabled',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });
  });

  describe('expectLockNumber', () => {
    test('adds lockNumber condition', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setStatus('NOT_YET_SUBMITTED')
        .expectLockNumber(1)
        .build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_1_1_lockNumber': 1,
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#lockNumber': 'lockNumber',
        },
        ConditionExpression:
          '(#lockNumber = :condition_1_1_lockNumber OR attribute_not_exists (#lockNumber))',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });
  });

  describe('incrementLockNumber', () => {
    test('increments lock number by 1', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.incrementLockNumber().build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
        },
        Key: {
          id: mockId,
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'ADD #lockNumber :lockNumber',
      });
    });
  });

  describe('setName', () => {
    test('sets the name', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      expect(builder.setName('some name').build()).toMatchObject({
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':name': 'some name',
        },
        UpdateExpression: 'SET #name = :name',
      });
    });
  });

  describe('setSubject', () => {
    test('sets the subject', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      expect(builder.setSubject('some subject').build()).toMatchObject({
        ExpressionAttributeNames: {
          '#subject': 'subject',
        },
        ExpressionAttributeValues: {
          ':subject': 'some subject',
        },
        UpdateExpression: 'SET #subject = :subject',
      });
    });
  });

  describe('setMessage', () => {
    test('sets the message', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      expect(builder.setMessage('some message').build()).toMatchObject({
        ExpressionAttributeNames: {
          '#message': 'message',
        },
        ExpressionAttributeValues: {
          ':message': 'some message',
        },
        UpdateExpression: 'SET #message = :message',
      });
    });
  });

  describe('setTTL', () => {
    test('sets the ttl', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      expect(builder.setTTL(20).build()).toMatchObject({
        ExpressionAttributeNames: {
          '#ttl': 'ttl',
        },
        ExpressionAttributeValues: {
          ':ttl': 20,
        },
        UpdateExpression: 'SET #ttl = :ttl',
      });
    });
  });

  describe('expectNotFinalStatus', () => {
    test('adds condition that status is not DELETED or SUBMITTED', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      expect(builder.expectNotFinalStatus().build()).toMatchObject({
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':condition_1_1_templateStatus': 'DELETED',
          ':condition_1_2_templateStatus': 'SUBMITTED',
        },
        ConditionExpression:
          'NOT #templateStatus IN (:condition_1_1_templateStatus, :condition_1_2_templateStatus)',
      });
    });
  });

  describe('expectNotStatus', () => {
    test('adds condition that status is not the given status', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      expect(builder.expectNotStatus('PENDING_UPLOAD').build()).toMatchObject({
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':condition_1_templateStatus': 'PENDING_UPLOAD',
        },
        ConditionExpression:
          'NOT #templateStatus = :condition_1_templateStatus',
      });
    });

    test('adds condition that status is not in the given status list', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      expect(
        builder.expectNotStatus(['PENDING_UPLOAD', 'VIRUS_SCAN_FAILED']).build()
      ).toMatchObject({
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':condition_1_1_templateStatus': 'PENDING_UPLOAD',
          ':condition_1_2_templateStatus': 'VIRUS_SCAN_FAILED',
        },
        ConditionExpression:
          'NOT #templateStatus IN (:condition_1_1_templateStatus, :condition_1_2_templateStatus)',
      });
    });
  });

  describe('setCampaignId', () => {
    test('sets campaignId field to provided value', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setCampaignId('new-campaign-id').build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':campaignId': 'new-campaign-id',
        },
        ExpressionAttributeNames: {
          '#campaignId': 'campaignId',
        },
        UpdateExpression: 'SET #campaignId = :campaignId',
      });
    });
  });

  describe('setPersonalisation', () => {
    test('sets systemPersonalisation and customPersonalisation fields', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setPersonalisation(['firstName', 'lastName'], ['appointmentDate'])
        .build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':systemPersonalisation': ['firstName', 'lastName'],
          ':customPersonalisation': ['appointmentDate'],
        },
        ExpressionAttributeNames: {
          '#systemPersonalisation': 'systemPersonalisation',
          '#customPersonalisation': 'customPersonalisation',
        },
        UpdateExpression:
          'SET #systemPersonalisation = :systemPersonalisation, #customPersonalisation = :customPersonalisation',
      });
    });
  });

  describe('setInitialRender', () => {
    test('sets initialRender in files map', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const renderDetails = {
        status: 'RENDERED' as const,
        fileName: 'test-file.pdf',
        currentVersion: 'v1',
        pageCount: 2,
      };

      const res = builder.setInitialRender(renderDetails).build();

      expect(res).toMatchObject({
        ExpressionAttributeNames: {
          '#files': 'files',
          '#initialRender': 'initialRender',
        },
        ExpressionAttributeValues: {
          ':initialRender': renderDetails,
        },
        UpdateExpression: 'SET #files.#initialRender = :initialRender',
      });
    });
  });

  describe('setShortFormRender', () => {
    test('sets shortFormRender in files map', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const renderDetails = {
        status: 'RENDERED' as const,
        fileName: 'short-form.pdf',
        currentVersion: 'v2',
        pageCount: 1,
        systemPersonalisationPackId: 'pack-1',
        personalisationParameters: { firstName: 'John' },
      };

      const res = builder.setShortFormRender(renderDetails).build();

      expect(res).toMatchObject({
        ExpressionAttributeNames: {
          '#files': 'files',
          '#shortFormRender': 'shortFormRender',
        },
        ExpressionAttributeValues: {
          ':shortFormRender': renderDetails,
        },
        UpdateExpression: 'SET #files.#shortFormRender = :shortFormRender',
      });
    });
  });

  describe('appendValidationErrors', () => {
    test('appends validation errors to existing list or creates it', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const errors: ValidationErrorDetail[] = [
        { name: 'MISSING_ADDRESS_LINES' },
        { name: 'INVALID_MARKERS', issues: ['marker-1', 'marker-2'] },
      ];

      const res = builder.appendValidationErrors(errors).build();

      expect(res).toMatchObject({
        ExpressionAttributeNames: {
          '#validationErrors': 'validationErrors',
        },
        ExpressionAttributeValues: {
          ':validationErrors': errors,
          ':emptyList': [],
        },
        UpdateExpression:
          'SET #validationErrors = list_append(if_not_exists(#validationErrors, :emptyList), :validationErrors)',
      });
    });
  });
});
