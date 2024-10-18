import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Session } from './types';
import { DatabaseTableNameHelper } from './database-tablename-helper';

export default class SessionStorageHelper {
  private readonly ddbDocClient: DynamoDBDocumentClient;

  constructor(private readonly sessionData: Session[]) {
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async seedSessionData() {
    const tableName =
      await DatabaseTableNameHelper.instance.getSessionStorageTableName();

    const currentTimeSeconds = Math.floor(Date.now() / 1000);

    const promises = this.sessionData.map((session) =>
      this.ddbDocClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            ...session,
            ttl: currentTimeSeconds + 60 * 5, // 5 minutes in the future
          },
        })
      )
    );

    await Promise.all(promises);
  }

  async deleteSessionData() {
    const tableName =
      await DatabaseTableNameHelper.instance.getSessionStorageTableName();

    const promises = this.sessionData.map((session) =>
      this.ddbDocClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            id: session.id,
          },
        })
      )
    );

    await Promise.all(promises);
  }
}
