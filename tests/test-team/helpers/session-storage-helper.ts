import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Session } from './types';
import { AmplifyAppSyncClient } from './amplify-appsync-client';

export default class SessionStorageHelper {
  private readonly amplifyAppSyncClient = new AmplifyAppSyncClient();

  private readonly ddbDocClient: DynamoDBDocumentClient;

  private tableName: string | undefined;

  constructor(private readonly sessionData: Session[]) {
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  private async buildAndSetSessionStorageTableName() {
    return `SessionStorage-${await this.amplifyAppSyncClient.getApiId()}-NONE`;
  }

  async seedSessionData(owner: string) {
    const tableName = await this.buildAndSetSessionStorageTableName();

    // removes the need to repeat building tableName when deleting session data
    this.tableName = tableName;

    const currentTimeSeconds = Math.floor(Date.now() / 1000);

    const promises = this.sessionData.map((session) =>
      this.ddbDocClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            ...session,
            owner,
            ttl: currentTimeSeconds + 60 * 5, // 5 minutes in the future
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
