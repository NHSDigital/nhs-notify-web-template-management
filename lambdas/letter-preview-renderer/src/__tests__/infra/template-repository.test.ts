import 'aws-sdk-client-mock-jest';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { TemplateRepository } from '../../infra/template-repository';
import type { Personalisation } from '../../types/types';
import {
  createInitialRequest,
  createPersonalisedRequest,
  createLongPersonalisedRequest,
} from '../fixtures/create-request';

const templatesTableName = 'test-templates-table';

function setup() {
  const ddbDocClient = mockClient(DynamoDBDocumentClient);

  const templateRepository = new TemplateRepository(
    ddbDocClient as unknown as DynamoDBDocumentClient,
    templatesTableName
  );

  return { templateRepository, mocks: { ddbDocClient } };
}

const createPersonalisation = (
  overrides: Partial<Personalisation> = {}
): Personalisation => ({
  system: ['address_line_1', 'address_line_2'],
  custom: ['first_name'],
  ...overrides,
});

describe('TemplateRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('updateRenderedInitial', () => {
    test('sends correct UpdateCommand for a valid initial render', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateRenderedInitial(
        request,
        personalisation,
        'v1',
        'abc123.pdf',
        3
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#systemPersonalisation': 'systemPersonalisation',
          '#customPersonalisation': 'customPersonalisation',
          '#files': 'files',
          '#initialRender': 'initialRender',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': 'NOT_YET_SUBMITTED',
          ':systemPersonalisation': ['address_line_1', 'address_line_2'],
          ':customPersonalisation': ['first_name'],
          ':initialRender': {
            status: 'RENDERED',
            currentVersion: 'v1',
            fileName: 'abc123.pdf',
            pageCount: 3,
          },
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #systemPersonalisation = :systemPersonalisation, #customPersonalisation = :customPersonalisation, #files.#initialRender = :initialRender ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });

    test('sends correct UpdateCommand with validation errors', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();
      const validationErrors = [
        { name: 'INVALID_MARKERS' as const, issues: ['x.y.z'] },
      ];

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateRenderedInitial(
        request,
        personalisation,
        'v1',
        'render.pdf',
        2,
        validationErrors
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#systemPersonalisation': 'systemPersonalisation',
          '#customPersonalisation': 'customPersonalisation',
          '#files': 'files',
          '#initialRender': 'initialRender',
          '#validationErrors': 'validationErrors',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': 'VALIDATION_FAILED',
          ':systemPersonalisation': ['address_line_1', 'address_line_2'],
          ':customPersonalisation': ['first_name'],
          ':initialRender': {
            status: 'RENDERED',
            currentVersion: 'v1',
            fileName: 'render.pdf',
            pageCount: 2,
          },
          ':validationErrors': validationErrors,
          ':emptyList': [],
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #systemPersonalisation = :systemPersonalisation, #customPersonalisation = :customPersonalisation, #files.#initialRender = :initialRender, #validationErrors = list_append(if_not_exists(#validationErrors, :emptyList), :validationErrors) ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });

    test('sends correct UpdateCommand when validation errors array is empty', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateRenderedInitial(
        request,
        personalisation,
        'v1',
        'render.pdf',
        2,
        []
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#systemPersonalisation': 'systemPersonalisation',
          '#customPersonalisation': 'customPersonalisation',
          '#files': 'files',
          '#initialRender': 'initialRender',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': 'NOT_YET_SUBMITTED',
          ':systemPersonalisation': ['address_line_1', 'address_line_2'],
          ':customPersonalisation': ['first_name'],
          ':initialRender': {
            status: 'RENDERED',
            currentVersion: 'v1',
            fileName: 'render.pdf',
            pageCount: 2,
          },
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #systemPersonalisation = :systemPersonalisation, #customPersonalisation = :customPersonalisation, #files.#initialRender = :initialRender ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });
  });

  describe('updateFailureInitial', () => {
    test('sends correct UpdateCommand without personalisation or validation errors', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailureInitial(request);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#files': 'files',
          '#initialRender': 'initialRender',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': 'VALIDATION_FAILED',
          ':initialRender': { status: 'FAILED' },
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #files.#initialRender = :initialRender ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });

    test('sends correct UpdateCommand with personalisation', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailureInitial(request, personalisation);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#files': 'files',
          '#initialRender': 'initialRender',
          '#systemPersonalisation': 'systemPersonalisation',
          '#customPersonalisation': 'customPersonalisation',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': 'VALIDATION_FAILED',
          ':initialRender': { status: 'FAILED' },
          ':systemPersonalisation': ['address_line_1', 'address_line_2'],
          ':customPersonalisation': ['first_name'],
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #files.#initialRender = :initialRender, #systemPersonalisation = :systemPersonalisation, #customPersonalisation = :customPersonalisation ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });

    test('sends correct UpdateCommand with personalisation and validation errors', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();
      const validationErrors = [
        { name: 'INVALID_MARKERS' as const, issues: ['foo.bar', 'baz.qux'] },
      ];

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailureInitial(
        request,
        personalisation,
        validationErrors
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#files': 'files',
          '#initialRender': 'initialRender',
          '#systemPersonalisation': 'systemPersonalisation',
          '#customPersonalisation': 'customPersonalisation',
          '#validationErrors': 'validationErrors',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': 'VALIDATION_FAILED',
          ':initialRender': { status: 'FAILED' },
          ':systemPersonalisation': ['address_line_1', 'address_line_2'],
          ':customPersonalisation': ['first_name'],
          ':validationErrors': validationErrors,
          ':emptyList': [],
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #files.#initialRender = :initialRender, #systemPersonalisation = :systemPersonalisation, #customPersonalisation = :customPersonalisation, #validationErrors = list_append(if_not_exists(#validationErrors, :emptyList), :validationErrors) ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });
  });

  describe('updateRenderedPersonalised', () => {
    test('sends correct UpdateCommand for short variant', async () => {
      const { templateRepository, mocks } = setup();
      const request = createPersonalisedRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateRenderedPersonalised(
        request,
        'v2',
        'short-render.pdf',
        2
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#files': 'files',
          '#shortFormRender': 'shortFormRender',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'NOT_YET_SUBMITTED',
          ':shortFormRender': {
            status: 'RENDERED',
            currentVersion: 'v2',
            fileName: 'short-render.pdf',
            pageCount: 2,
            systemPersonalisationPackId: 'test-pack-id',
            personalisationParameters: { first_name: 'Test' },
          },
        },
        UpdateExpression:
          'SET #files.#shortFormRender = :shortFormRender ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });

    test('sends correct UpdateCommand for long variant', async () => {
      const { templateRepository, mocks } = setup();
      const request = createLongPersonalisedRequest({
        personalisation: { full_address: '123 Test Street' },
        systemPersonalisationPackId: 'long-pack-id',
      });

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateRenderedPersonalised(
        request,
        'v3',
        'long-render.pdf',
        4
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#files': 'files',
          '#longFormRender': 'longFormRender',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'NOT_YET_SUBMITTED',
          ':longFormRender': {
            status: 'RENDERED',
            currentVersion: 'v3',
            fileName: 'long-render.pdf',
            pageCount: 4,
            systemPersonalisationPackId: 'long-pack-id',
            personalisationParameters: { full_address: '123 Test Street' },
          },
        },
        UpdateExpression:
          'SET #files.#longFormRender = :longFormRender ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });
  });

  describe('updateFailurePersonalised', () => {
    test('sends correct UpdateCommand for short variant failure', async () => {
      const { templateRepository, mocks } = setup();
      const request = createPersonalisedRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailurePersonalised(request);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#files': 'files',
          '#shortFormRender': 'shortFormRender',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'NOT_YET_SUBMITTED',
          ':shortFormRender': {
            status: 'FAILED',
            systemPersonalisationPackId: 'test-pack-id',
            personalisationParameters: { first_name: 'Test' },
          },
        },
        UpdateExpression:
          'SET #files.#shortFormRender = :shortFormRender ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });

    test('sends correct UpdateCommand for long variant failure', async () => {
      const { templateRepository, mocks } = setup();
      const request = createLongPersonalisedRequest({
        personalisation: { full_address: '456 Test Avenue' },
        systemPersonalisationPackId: 'long-pack-id',
      });

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailurePersonalised(request);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#id': 'id',
          '#templateStatus': 'templateStatus',
          '#files': 'files',
          '#longFormRender': 'longFormRender',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
          ':condition_2_templateStatus': 'NOT_YET_SUBMITTED',
          ':longFormRender': {
            status: 'FAILED',
            systemPersonalisationPackId: 'long-pack-id',
            personalisationParameters: { full_address: '456 Test Avenue' },
          },
        },
        UpdateExpression:
          'SET #files.#longFormRender = :longFormRender ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus',
      });
    });
  });
});
