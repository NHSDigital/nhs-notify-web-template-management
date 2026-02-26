import 'aws-sdk-client-mock-jest';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { TemplateRepository } from '../../infra/template-repository';
import type { Personalisation } from '../../types/types';
import {
  createInitialRequest,
  createPersonalisedRequest,
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

  describe('updateRendered', () => {
    test('sends correct UpdateCommand for a valid initial render', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateRendered(
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

      await templateRepository.updateRendered(
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

      await templateRepository.updateRendered(
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

    test('skips update for non-initial request types', async () => {
      const { templateRepository, mocks } = setup();
      const request = createPersonalisedRequest();
      const personalisation = createPersonalisation();

      const result = await templateRepository.updateRendered(
        request,
        personalisation,
        'v1',
        'abc123.pdf',
        3
      );

      expect(result).toBeUndefined();
      expect(mocks.ddbDocClient).not.toHaveReceivedCommand(UpdateCommand);
    });
  });

  describe('updateFailure', () => {
    test('sends correct UpdateCommand without personalisation or validation errors', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(request);

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

    test('sends correct UpdateCommand with personalisation and validation errors', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();
      const validationErrors = [
        { name: 'INVALID_MARKERS' as const, issues: ['foo.bar', 'baz.qux'] },
      ];

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(
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

    test('skips update for non-initial request types', async () => {
      const { templateRepository, mocks } = setup();
      const request = createPersonalisedRequest();

      const result = await templateRepository.updateFailure(request);

      expect(result).toBeUndefined();
      expect(mocks.ddbDocClient).not.toHaveReceivedCommand(UpdateCommand);
    });
  });
});
