import 'aws-sdk-client-mock-jest';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { TemplateRepository } from '../../infra/template-repository';
import type {
  InitialRenderRequest,
  ShortPersonalisedRenderRequest,
} from 'nhs-notify-backend-client/src/types/render-request';
import type { Personalisation } from '../../types/types';

const templatesTableName = 'test-templates-table';

function setup() {
  const ddbDocClient = mockClient(DynamoDBDocumentClient);

  const templateRepository = new TemplateRepository(
    ddbDocClient as unknown as DynamoDBDocumentClient,
    templatesTableName
  );

  return { templateRepository, mocks: { ddbDocClient } };
}

const createInitialRequest = (
  overrides: Partial<Omit<InitialRenderRequest, 'requestType'>> = {}
): InitialRenderRequest => ({
  requestType: 'initial',
  clientId: 'test-client',
  templateId: 'test-template',
  currentVersion: 'test-version',
  ...overrides,
});

const createPersonalisedRequest = (
  overrides: Partial<Omit<ShortPersonalisedRenderRequest, 'requestType'>> = {}
): ShortPersonalisedRenderRequest => ({
  requestType: 'personalised',
  requestTypeVariant: 'short',
  clientId: 'test-client',
  templateId: 'test-template',
  currentVersion: 'test-version',
  personalisation: { first_name: 'Test' },
  lockNumber: 1,
  ...overrides,
});

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

  describe('updateSuccess', () => {
    test('sends UpdateCommand with correct builder output for initial request', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateSuccess(
        request,
        personalisation,
        'v1',
        'abc123.pdf',
        3
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
      });
    });

    test('skips update for non-initial request types', async () => {
      const { templateRepository, mocks } = setup();
      const request = createPersonalisedRequest();
      const personalisation = createPersonalisation();

      const result = await templateRepository.updateSuccess(
        request,
        personalisation,
        'v1',
        'abc123.pdf',
        3
      );

      expect(result).toBeUndefined();
      expect(mocks.ddbDocClient).not.toHaveReceivedCommand(UpdateCommand);
    });

    test('sets status to NOT_YET_SUBMITTED and render status to RENDERED', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateSuccess(
        request,
        personalisation,
        'v1',
        'render.pdf',
        2
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeValues: expect.objectContaining({
          ':templateStatus': 'NOT_YET_SUBMITTED',
        }),
      });
    });

    test('sets personalisation fields', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation({
        system: ['address_line_1'],
        custom: ['last_name', 'dob'],
      });

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateSuccess(
        request,
        personalisation,
        'v1',
        'render.pdf',
        1
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeValues: expect.objectContaining({
          ':systemPersonalisation': ['address_line_1'],
          ':customPersonalisation': ['last_name', 'dob'],
        }),
      });
    });

    test('sets status to VALIDATION_FAILED and appends validation errors when provided', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();
      const validationErrors = [
        { name: 'INVALID_MARKERS' as const, issues: ['foo.bar'] },
      ];

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateSuccess(
        request,
        personalisation,
        'v1',
        'render.pdf',
        2,
        validationErrors
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeValues: expect.objectContaining({
          ':templateStatus': 'VALIDATION_FAILED',
          ':validationErrors': validationErrors,
        }),
      });
    });

    test('does not append validation errors when array is empty', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateSuccess(
        request,
        personalisation,
        'v1',
        'render.pdf',
        2,
        []
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeValues: expect.objectContaining({
          ':templateStatus': 'NOT_YET_SUBMITTED',
        }),
      });

      const receivedCommand = mocks.ddbDocClient.commandCalls(UpdateCommand);
      const expressionValues =
        receivedCommand[0]?.args[0]?.input?.ExpressionAttributeValues ?? {};

      expect(expressionValues).not.toHaveProperty(':validationErrors');
    });
  });

  describe('updateFailure', () => {
    test('sends UpdateCommand with correct builder output for initial request', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(request);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: templatesTableName,
        Key: { owner: 'CLIENT#test-client', id: 'test-template' },
      });
    });

    test('skips update for non-initial request types', async () => {
      const { templateRepository, mocks } = setup();
      const request = createPersonalisedRequest();

      const result = await templateRepository.updateFailure(request);

      expect(result).toBeUndefined();
      expect(mocks.ddbDocClient).not.toHaveReceivedCommand(UpdateCommand);
    });

    test('sets status to VALIDATION_FAILED and render status to FAILED', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(request);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeValues: expect.objectContaining({
          ':templateStatus': 'VALIDATION_FAILED',
        }),
      });
    });

    test('sets personalisation when provided', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();
      const personalisation = createPersonalisation();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(request, personalisation);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeValues: expect.objectContaining({
          ':systemPersonalisation': ['address_line_1', 'address_line_2'],
          ':customPersonalisation': ['first_name'],
        }),
      });
    });

    test('does not set personalisation when not provided', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(request);

      const receivedCommand = mocks.ddbDocClient.commandCalls(UpdateCommand);
      const expressionValues =
        receivedCommand[0]?.args[0]?.input?.ExpressionAttributeValues ?? {};

      expect(expressionValues).not.toHaveProperty(':systemPersonalisation');
      expect(expressionValues).not.toHaveProperty(':customPersonalisation');
    });

    test('appends validation errors when provided', async () => {
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
        ExpressionAttributeValues: expect.objectContaining({
          ':validationErrors': validationErrors,
        }),
      });
    });

    test('does not append validation errors when array is empty', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(request, undefined, []);

      const receivedCommand = mocks.ddbDocClient.commandCalls(UpdateCommand);
      const expressionValues =
        receivedCommand[0]?.args[0]?.input?.ExpressionAttributeValues ?? {};

      expect(expressionValues).not.toHaveProperty(':validationErrors');
    });

    test('does not append validation errors when not provided', async () => {
      const { templateRepository, mocks } = setup();
      const request = createInitialRequest();

      mocks.ddbDocClient.on(UpdateCommand).resolves({});

      await templateRepository.updateFailure(request);

      const receivedCommand = mocks.ddbDocClient.commandCalls(UpdateCommand);
      const expressionValues =
        receivedCommand[0]?.args[0]?.input?.ExpressionAttributeValues ?? {};

      expect(expressionValues).not.toHaveProperty(':validationErrors');
    });
  });
});
