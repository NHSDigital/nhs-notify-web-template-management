/* eslint-disable import/no-unresolved */
import {
  AppSyncClient,
  paginateListGraphqlApis,
  GraphqlApi,
} from '@aws-sdk/client-appsync';
import { Amplify } from 'aws-amplify';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import * as fs from 'node:fs';
import { Session } from './types';

export default class SessionStorageHelper {
  private readonly appSyncClient: AppSyncClient;

  private readonly ddbDocClient: DynamoDBDocumentClient;

  private tableName: string | undefined;

  constructor(private readonly sessionData: Session[]) {
    this.appSyncClient = new AppSyncClient({ region: 'eu-west-2' });
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  private async listGraphqlAPIs() {
    const apiList: GraphqlApi[] = [];

    const paginator = paginateListGraphqlApis(
      { client: this.appSyncClient },
      {}
    );

    for await (const page of paginator) {
      const apiData = page.graphqlApis ?? [];
      apiList.push(...apiData);
    }

    return apiList;
  }

  private async buildAndSetSessionStorageTableName() {
    const amplifyOutput = JSON.parse(
      fs.readFileSync('../../amplify_outputs.json', 'utf8')
    );

    Amplify.configure(amplifyOutput);

    const graphqlAPIs = await this.listGraphqlAPIs();
    const outputUri = Amplify.getConfig().API?.GraphQL?.endpoint;

    const matchingGraphqlAPI = graphqlAPIs.find(
      (graphqlAPI) => graphqlAPI.uris?.GRAPHQL === outputUri
    );

    return `SessionStorage-${matchingGraphqlAPI?.apiId}-NONE`;
  }

  async seedSessionData() {
    const tableName = await this.buildAndSetSessionStorageTableName();

    // removes the need to repeat building tableName when deleting session data
    this.tableName = tableName;

    const promises = this.sessionData.map((session) =>
      this.ddbDocClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            ...session,
            ttl: 500,
          },
        })
      )
    );

    await Promise.all(promises);
  }

  async deleteSessionData() {
    const promises = this.sessionData.map((session) =>
      this.ddbDocClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            id: session.id,
          },
        })
      )
    );

    await Promise.all(promises);
  }
}
