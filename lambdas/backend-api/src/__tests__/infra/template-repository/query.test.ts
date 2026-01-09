import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { TemplateRepository } from '../../../infra';
import {
  makeAppTemplate,
  makeEmailTemplate,
  makeLetterTemplate,
  makeSmsTemplate,
} from '../../fixtures/template';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('nhs-notify-web-template-management-utils/logger');

const TABLE_NAME = 'template-table-name';

const clientId = '89077697-ca6d-47fc-b233-3281fbd15579';
const clientOwnerKey = `CLIENT#${clientId}`;

const appTemplates = makeAppTemplate();
const emailTemplates = makeEmailTemplate();
const smsTemplates = makeSmsTemplate();
const letterTemplates = makeLetterTemplate();

function setup() {
  const dynamo = mockClient(DynamoDBDocumentClient);

  const repo = new TemplateRepository(
    // pass an actual doc client - it gets intercepted up by mockClient,
    // but paginateQuery needs the real deal
    DynamoDBDocumentClient.from(new DynamoDBClient({})),
    TABLE_NAME
  );

  const mocks = { dynamo };

  return { mocks, repo };
}

describe('TemplateRepo#query', () => {
  describe('list', () => {
    test('queries by owner, paginates across pages, returns all items', async () => {
      const { repo, mocks } = setup();

      const page1: DatabaseTemplate[] = [
        appTemplates.databaseTemplate,
        emailTemplates.databaseTemplate,
      ];
      const page2: DatabaseTemplate[] = [
        smsTemplates.databaseTemplate,
        letterTemplates.databaseTemplate,
      ];

      mocks.dynamo
        .on(QueryCommand)
        .resolvesOnce({
          Items: page1,
          LastEvaluatedKey: {
            owner: clientOwnerKey,
            id: emailTemplates.databaseTemplate.id,
          },
        })
        .resolvesOnce({
          Items: page2,
        });

      const result = await repo.query(clientId).list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 2);
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(1, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
        ExclusiveStartKey: {
          owner: clientOwnerKey,
          id: emailTemplates.databaseTemplate.id,
        },
      });
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(2, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
      });

      expect(result.data).toEqual([
        appTemplates.dtoTemplate,
        emailTemplates.dtoTemplate,
        smsTemplates.dtoTemplate,
        letterTemplates.dtoTemplate,
      ]);
    });

    test('supports filtering by status (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .templateStatus('SUBMITTED', 'DELETED')
        .templateStatus('NOT_YET_SUBMITTED')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          '(#templateStatus IN (:templateStatus0, :templateStatus1, :templateStatus2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#templateStatus': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':templateStatus0': 'SUBMITTED',
          ':templateStatus1': 'DELETED',
          ':templateStatus2': 'NOT_YET_SUBMITTED',
        },
      });
    });

    test('supports excluding statuses (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .excludeTemplateStatus('SUBMITTED', 'DELETED')
        .excludeTemplateStatus('NOT_YET_SUBMITTED')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          'NOT(#templateStatus IN (:nottemplateStatus0, :nottemplateStatus1, :nottemplateStatus2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#templateStatus': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':nottemplateStatus0': 'SUBMITTED',
          ':nottemplateStatus1': 'DELETED',
          ':nottemplateStatus2': 'NOT_YET_SUBMITTED',
        },
      });
    });

    test('supports filtering by template type (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .templateType('SMS', 'NHS_APP')
        .templateType('EMAIL')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          '(#templateType IN (:templateType0, :templateType1, :templateType2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#templateType': 'templateType',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':templateType0': 'SMS',
          ':templateType1': 'NHS_APP',
          ':templateType2': 'EMAIL',
        },
      });
    });

    test('supports filtering by language (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo.query(clientId).language('en', 'fr').language('es').list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression: '(#language IN (:language0, :language1, :language2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#language': 'language',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':language0': 'en',
          ':language1': 'fr',
          ':language2': 'es',
        },
      });
    });

    test('supports excluding language (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .excludeLanguage('en', 'fr')
        .excludeLanguage('es')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          'NOT(#language IN (:notlanguage0, :notlanguage1, :notlanguage2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#language': 'language',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':notlanguage0': 'en',
          ':notlanguage1': 'fr',
          ':notlanguage2': 'es',
        },
      });
    });

    test('supports filtering by letter type (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo.query(clientId).letterType('x0', 'x1').letterType('q4').list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          '(#letterType IN (:letterType0, :letterType1, :letterType2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#letterType': 'letterType',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':letterType0': 'x0',
          ':letterType1': 'x1',
          ':letterType2': 'q4',
        },
      });
    });

    test('supports mixed filters', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .templateStatus('SUBMITTED')
        .excludeTemplateStatus('DELETED')
        .templateType('LETTER')
        .language('en')
        .excludeLanguage('fr')
        .letterType('x0')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          '(#templateStatus IN (:templateStatus0)) AND NOT(#templateStatus IN (:nottemplateStatus0)) AND (#templateType IN (:templateType0)) AND (#language IN (:language0)) AND NOT(#language IN (:notlanguage0)) AND (#letterType IN (:letterType0))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#language': 'language',
          '#letterType': 'letterType',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':nottemplateStatus0': 'DELETED',
          ':templateStatus0': 'SUBMITTED',
          ':templateType0': 'LETTER',
          ':language0': 'en',
          ':notlanguage0': 'fr',
          ':letterType0': 'x0',
        },
      });
    });

    test('dedupes filters', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .templateStatus('SUBMITTED')
        .templateStatus('SUBMITTED')
        .excludeTemplateStatus('DELETED')
        .excludeTemplateStatus('DELETED')
        .templateType('LETTER')
        .templateType('LETTER')
        .language('en')
        .language('en')
        .excludeLanguage('fr')
        .excludeLanguage('fr')
        .letterType('x0')
        .letterType('x0')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          '(#templateStatus IN (:templateStatus0)) AND NOT(#templateStatus IN (:nottemplateStatus0)) AND (#templateType IN (:templateType0)) AND (#language IN (:language0)) AND NOT(#language IN (:notlanguage0)) AND (#letterType IN (:letterType0))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#language': 'language',
          '#letterType': 'letterType',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':nottemplateStatus0': 'DELETED',
          ':templateStatus0': 'SUBMITTED',
          ':templateType0': 'LETTER',
          ':language0': 'en',
          ':notlanguage0': 'fr',
          ':letterType0': 'x0',
        },
      });
    });

    test('filters out invalid template items', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [
          appTemplates.databaseTemplate,
          { owner: clientOwnerKey, id: '2eb0b8f5-63f0-4512-8a95-5b82e7c4b07b' },
          emailTemplates.databaseTemplate,
        ],
      });

      const result = await repo.query(clientId).list();

      expect(result.data).toEqual([
        appTemplates.dtoTemplate,
        emailTemplates.dtoTemplate,
      ]);
    });

    test('handles no items from dynamo', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({});

      const result = await repo.query(clientId).list();

      expect(result.data).toEqual([]);
    });

    test('handles exceptions from dynamodb', async () => {
      const { repo, mocks } = setup();

      const e = new Error('oh no');

      mocks.dynamo.on(QueryCommand).rejectsOnce(e);

      const result = await repo.query(clientId).list();

      expect(result.error).toMatchObject({
        actualError: e,
        errorMeta: expect.objectContaining({ code: 500 }),
      });
      expect(result.data).toBeUndefined();
    });
  });

  describe('count', () => {
    test('queries by owner, paginates across pages, returns count of items', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo
        .on(QueryCommand)
        .resolvesOnce({
          Count: 2,
          LastEvaluatedKey: {
            owner: clientOwnerKey,
            id: emailTemplates.databaseTemplate.id,
          },
        })
        .resolvesOnce({
          Count: 1,
        });

      const result = await repo.query(clientId).count();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 2);
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(1, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
        Select: 'COUNT',
        ExclusiveStartKey: {
          owner: clientOwnerKey,
          id: emailTemplates.databaseTemplate.id,
        },
      });
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(2, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
        Select: 'COUNT',
      });

      expect(result.data).toEqual({ count: 3 });
    });

    test('handles no items from dynamo', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({});

      const result = await repo.query(clientId).count();

      expect(result.data).toEqual({ count: 0 });
    });

    test('handles exceptions from dynamodb', async () => {
      const { repo, mocks } = setup();

      const e = new Error('oh no');

      mocks.dynamo.on(QueryCommand).rejectsOnce(e);

      const result = await repo.query(clientId).count();

      expect(result.error).toMatchObject({
        actualError: e,
        errorMeta: expect.objectContaining({ code: 500 }),
      });
      expect(result.data).toBeUndefined();
    });
  });
});
