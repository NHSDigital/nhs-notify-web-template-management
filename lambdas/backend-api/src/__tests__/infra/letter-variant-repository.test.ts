import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ErrorCase } from 'nhs-notify-backend-client';
import { InMemoryCache } from 'nhs-notify-web-template-management-utils';
import {
  LetterVariantQueryFilters,
  LetterVariantRepository,
} from '../../infra/letter-variant-repository';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';

jest.mock('nhs-notify-web-template-management-utils', () => {
  const actual = jest.requireActual('nhs-notify-web-template-management-utils');

  return {
    ...actual,
    InMemoryCache: jest.fn(),
  };
});

const tableName = 'letter-variants-table';

const makeLetterVariant = (
  overrides: Partial<LetterVariant> = {}
): LetterVariant => ({
  id: 'variant-1',
  name: 'Standard C5',
  sheetSize: 'A4',
  maxSheets: 5,
  bothSides: true,
  printColour: 'black',
  envelopeSize: 'C5',
  dispatchTime: 'standard',
  postage: 'economy',
  status: 'PROD',
  type: 'STANDARD',
  ...overrides,
});

type CacheMock<T> = {
  get: jest.Mock<T | undefined, [string]>;
  set: jest.Mock<void, [string, T]>;
  clear: jest.Mock<void, []>;
};

const setup = (cacheTtlMs = 60_000) => {
  const documentClient = mockClient(DynamoDBDocumentClient);
  const byIdCache: CacheMock<LetterVariant> = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };
  const byScopeCache: CacheMock<LetterVariant[]> = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };

  const InMemoryCacheMock = jest.mocked(InMemoryCache);

  InMemoryCacheMock.mockImplementationOnce(
    () => byIdCache as unknown as InMemoryCache<LetterVariant>
  ).mockImplementationOnce(
    () => byScopeCache as unknown as InMemoryCache<LetterVariant[]>
  );

  const repository = new LetterVariantRepository(
    documentClient as unknown as DynamoDBDocumentClient,
    tableName,
    cacheTtlMs
  );

  return {
    repository,
    mocks: {
      documentClient,
      byIdCache,
      byScopeCache,
      InMemoryCacheMock,
    },
  };
};

describe('LetterVariantRepository', () => {
  beforeEach(jest.resetAllMocks);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('put', () => {
    it('writes a valid variant and returns success', async () => {
      const { repository, mocks } = setup();
      const variant = makeLetterVariant({ clientId: 'client-1' });

      const result = await repository.put(variant);

      expect(result).toEqual({ data: variant });
      expect(mocks.documentClient).toHaveReceivedCommandWith(PutCommand, {
        TableName: tableName,
        Item: {
          ...variant,
          PK: 'VARIANT#variant-1',
          SK: 'METADATA',
          ByScopeIndexPK: 'CLIENT#client-1',
          ByScopeIndexSK: 'STANDARD#PROD#variant-1',
        },
      });
      expect(mocks.byIdCache.set).toHaveBeenCalledWith(variant.id, variant);
      expect(mocks.byScopeCache.clear).toHaveBeenCalledTimes(1);
    });

    it('returns VALIDATION_FAILED when payload is invalid', async () => {
      const { repository, mocks } = setup();
      const variant = makeLetterVariant({
        clientId: undefined,
        campaignId: 'campaign-1',
      });

      const result = await repository.put(variant);

      expect(result).toMatchObject({
        error: {
          errorMeta: {
            code: ErrorCase.VALIDATION_FAILED,
            description: 'Invalid Letter Variant',
          },
        },
      });
      expect(mocks.documentClient).not.toHaveReceivedCommand(PutCommand);
    });

    it('returns INTERNAL when DynamoDB write fails', async () => {
      const { repository, mocks } = setup();
      const variant = makeLetterVariant();

      mocks.documentClient.on(PutCommand).rejectsOnce(new Error('ddb failed'));

      const result = await repository.put(variant);

      expect(result).toMatchObject({
        error: {
          errorMeta: {
            code: ErrorCase.INTERNAL,
            description: 'Error writing Letter Variant to database',
          },
        },
      });
    });
  });

  describe('getById', () => {
    it('returns variant when found and valid', async () => {
      const { repository, mocks } = setup();
      const variant = makeLetterVariant();

      mocks.documentClient.on(GetCommand).resolvesOnce({ Item: variant });

      const result = await repository.getById(variant.id);

      expect(result).toEqual({ data: variant });
      expect(mocks.documentClient).toHaveReceivedCommandWith(GetCommand, {
        TableName: tableName,
        Key: {
          PK: 'VARIANT#variant-1',
          SK: 'METADATA',
        },
      });
    });

    it('returns NOT_FOUND when no item is returned', async () => {
      const { repository, mocks } = setup();

      mocks.documentClient.on(GetCommand).resolvesOnce({ Item: undefined });

      const result = await repository.getById('missing-id');

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: ErrorCase.NOT_FOUND,
            description: 'Letter Variant not found',
            details: undefined,
          },
          actualError: undefined,
        },
      });
    });

    it('returns INTERNAL when returned item fails schema validation', async () => {
      const { repository, mocks } = setup();

      mocks.documentClient.on(GetCommand).resolvesOnce({
        Item: { id: 'variant-1' },
      });

      const result = await repository.getById('variant-1');

      expect(result).toMatchObject({
        error: {
          errorMeta: {
            code: ErrorCase.INTERNAL,
            description: 'Error fetching Letter Variant from database',
          },
        },
      });
    });

    it('returns INTERNAL when DynamoDB get fails', async () => {
      const { repository, mocks } = setup();

      mocks.documentClient.on(GetCommand).rejectsOnce(new Error('ddb failed'));

      const result = await repository.getById('variant-1');

      expect(result).toMatchObject({
        error: {
          errorMeta: {
            code: ErrorCase.INTERNAL,
            description: 'Error fetching Letter Variant from database',
          },
        },
      });
    });

    it('returns cached variant on subsequent getById calls', async () => {
      const { repository, mocks } = setup();
      const variant = makeLetterVariant();

      mocks.byIdCache.get
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(variant);
      mocks.documentClient.on(GetCommand).resolvesOnce({ Item: variant });

      const firstResult = await repository.getById(variant.id);
      const secondResult = await repository.getById(variant.id);

      expect(firstResult).toEqual({ data: variant });
      expect(secondResult).toEqual({ data: variant });
      expect(mocks.documentClient.commandCalls(GetCommand)).toHaveLength(1);
    });

    it('writes fetched value to byId cache', async () => {
      const { repository, mocks } = setup();
      const variant = makeLetterVariant();

      mocks.byIdCache.get.mockReturnValueOnce(undefined);
      mocks.documentClient.on(GetCommand).resolvesOnce({ Item: variant });

      const result = await repository.getById(variant.id);

      expect(result).toEqual({ data: variant });
      expect(mocks.byIdCache.set).toHaveBeenCalledWith(variant.id, variant);
      expect(mocks.documentClient.commandCalls(GetCommand)).toHaveLength(1);
    });
  });

  describe('query by scope methods', () => {
    const queryMethods: Array<{
      name: string;
      expectedScope: string;
      call: (
        repository: LetterVariantRepository,
        filters?: Partial<Pick<LetterVariant, 'type' | 'status'>>
      ) => ReturnType<LetterVariantRepository['getGlobalLetterVariants']>;
    }> = [
      {
        name: 'getGlobalLetterVariants',
        expectedScope: 'GLOBAL',
        call: (repository, filters) =>
          repository.getGlobalLetterVariants(filters),
      },
      {
        name: 'getClientScopedLetterVariants',
        expectedScope: 'CLIENT#client-1',
        call: (repository, filters) =>
          repository.getClientScopedLetterVariants('client-1', filters),
      },
      {
        name: 'getCampaignScopedLetterVariants',
        expectedScope: 'CAMPAIGN#client-1#campaign-1',
        call: (repository, filters) =>
          repository.getCampaignScopedLetterVariants(
            'client-1',
            'campaign-1',
            filters
          ),
      },
    ];

    const filterCases: Array<{
      name: string;
      filters?: LetterVariantQueryFilters;
      keyConditionExpression: string;
      filterExpression?: string;
      expressionAttributeNames: Record<string, string>;
      filterExpressionAttributeValues: Record<string, string>;
    }> = [
      {
        name: 'none',
        keyConditionExpression: '#pk = :scope',
        expressionAttributeNames: {
          '#pk': 'ByScopeIndexPK',
        },
        filterExpressionAttributeValues: {},
      },
      {
        name: 'type only',
        filters: { type: 'STANDARD' },
        keyConditionExpression: '#pk = :scope AND begins_with(#sk, :skPrefix)',
        expressionAttributeNames: {
          '#pk': 'ByScopeIndexPK',
          '#sk': 'ByScopeIndexSK',
        },
        filterExpressionAttributeValues: {
          ':skPrefix': 'STANDARD#',
        },
      },
      {
        name: 'status only',
        filters: { status: 'DRAFT' },
        keyConditionExpression: '#pk = :scope',
        filterExpression: '#status = :status',
        expressionAttributeNames: {
          '#pk': 'ByScopeIndexPK',
          '#status': 'status',
        },
        filterExpressionAttributeValues: {
          ':status': 'DRAFT',
        },
      },
      {
        name: 'type and status',
        filters: { type: 'STANDARD', status: 'DRAFT' },
        keyConditionExpression: '#pk = :scope AND begins_with(#sk, :skPrefix)',
        expressionAttributeNames: {
          '#pk': 'ByScopeIndexPK',
          '#sk': 'ByScopeIndexSK',
        },
        filterExpressionAttributeValues: {
          ':skPrefix': 'STANDARD#DRAFT#',
        },
      },
    ];

    describe.each(queryMethods)('$name', ({ call, expectedScope }) => {
      describe.each(filterCases)('filters: $name', (filterCase) => {
        it('builds the expected query and returns parsed items', async () => {
          const { repository, mocks } = setup();
          const variant = makeLetterVariant();

          mocks.documentClient
            .on(QueryCommand)
            .resolvesOnce({ Items: [variant] });

          const result = await call(repository, filterCase.filters);

          expect(result).toEqual({ data: [variant] });
          expect(mocks.documentClient).toHaveReceivedCommandWith(QueryCommand, {
            TableName: tableName,
            IndexName: 'ByScope',
            KeyConditionExpression: filterCase.keyConditionExpression,
            FilterExpression: filterCase.filterExpression,
            ExpressionAttributeNames: filterCase.expressionAttributeNames,
            ExpressionAttributeValues: {
              ':scope': expectedScope,
              ...filterCase.filterExpressionAttributeValues,
            },
          });
        });
      });

      it('paginates across multiple Query calls', async () => {
        const { repository, mocks } = setup();
        const validVariant = makeLetterVariant({ id: 'variant-2' });

        mocks.documentClient
          .on(QueryCommand)
          .resolvesOnce({
            Items: [{ id: 'invalid-row' }],
            LastEvaluatedKey: {
              PK: 'VARIANT#variant-2',
              SK: 'METADATA',
            },
          })
          .resolvesOnce({
            Items: [validVariant],
          });

        const result = await call(repository);

        expect(result).toEqual({ data: [validVariant] });

        const calls = mocks.documentClient.commandCalls(QueryCommand);

        expect(calls).toHaveLength(2);
        expect(calls[1].args[0].input.ExclusiveStartKey).toEqual({
          PK: 'VARIANT#variant-2',
          SK: 'METADATA',
        });
      });

      it('returns INTERNAL when scoped query fails', async () => {
        const { repository, mocks } = setup();

        mocks.documentClient
          .on(QueryCommand)
          .rejectsOnce(new Error('query failed'));

        const result = await call(repository);

        expect(result).toMatchObject({
          error: {
            errorMeta: {
              code: ErrorCase.INTERNAL,
              description: 'Error querying letter variants',
            },
          },
        });
      });

      it('returns empty data when Query response has no Items', async () => {
        const { repository, mocks } = setup();

        mocks.documentClient.on(QueryCommand).resolvesOnce({});

        const result = await call(repository);

        expect(result).toEqual({ data: [] });
        expect(mocks.byScopeCache.set).toHaveBeenCalledWith(
          `${expectedScope}||`,
          []
        );
      });

      it('returns cached results on repeated calls with the same filters', async () => {
        const { repository, mocks } = setup();
        const variant = makeLetterVariant();
        const filters: LetterVariantQueryFilters = {
          type: 'STANDARD',
          status: 'PROD',
        };

        mocks.documentClient.on(QueryCommand).resolvesOnce({
          Items: [variant],
        });

        mocks.byScopeCache.get
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce([variant]);

        const firstResult = await call(repository, filters);
        const secondResult = await call(repository, filters);

        expect(firstResult).toEqual({ data: [variant] });
        expect(secondResult).toEqual({ data: [variant] });
        expect(mocks.documentClient.commandCalls(QueryCommand)).toHaveLength(1);
      });
    });
  });
});
