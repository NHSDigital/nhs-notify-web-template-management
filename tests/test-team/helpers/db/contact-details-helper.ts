import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  CloudWatchLogsClient,
  GetQueryResultsCommand,
  StartQueryCommand,
  StartQueryCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { chunk } from 'helpers/chunk';
import { setTimeout } from 'node:timers/promises';
import { FactoryContactDetail } from 'helpers/factories/contact-details-factory';

export type ContactDetailKey = {
  clientId: string;
  type: string;
  value: string;
};

export class ContactDetailHelper {
  private readonly dynamo = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  private cloudwatch = new CloudWatchLogsClient({ region: 'eu-west-2' });

  private readonly startTime = Math.floor(Date.now() / 1000);

  private adHocKeys: ContactDetailKey[] = [];
  private seedData: ContactDetailKey[] = [];
  /**
   * Stores references to contact details created in tests (not via seeding)
   */
  public addAdHoc(key: ContactDetailKey) {
    this.adHocKeys.push(key);
  }

  /**
   * Seed a load of contact details into the database
   */
  async seed(data: FactoryContactDetail[]) {
    this.seedData.push(...data);

    const chunks = chunk(data);

    await Promise.all(
      chunks.map(async (batch) => {
        await this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.CONTACT_DETAILS_TABLE_NAME]: batch.map((item) => ({
                PutRequest: {
                  Item: {
                    PK: `CLIENT#${item.clientId}`,
                    SK: `${item.type}#${item.value}`,
                    ...item,
                  },
                },
              })),
            },
          })
        );
      })
    );
  }

  /**
   * Delete contact details referenced by calls to addAdHoc
   */
  async deleteAdHoc() {
    await this.delete(this.adHocKeys);
    this.adHocKeys = [];
  }

  /**
   * Delete contact details seeded by calls to `seed`
   */
  public async deleteSeeded() {
    await this.delete(this.seedData);
    this.seedData = [];
  }

  /**
   * Delete all seeded and adhoc contact details
   */
  public async cleanup() {
    await Promise.all([this.deleteAdHoc(), this.deleteSeeded()]);
  }

  /**
   * Retrieves OTP for a validation request from CloudWatch Logs
   * This is a workaround until we actually send the OTP
   * It can take a few minutes for the log to show in CloudWatch
   * But I did the work so keeping this here until we have a better solution
   * As it will be needed for verification in CCM-15087
   */
  async getOtp(id: string) {
    const queryString = `fields message.otp as otp | filter message.id = "${id}" | limit 1 | sort @timestamp desc`;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const query = await this.cloudwatch.send(
        new StartQueryCommand({
          logGroupName:
            process.env.REQUEST_CONTACT_DETAILS_VERIFICATION_LOG_GROUP_NAME,
          startTime: this.startTime,
          endTime: Math.floor(Date.now() / 1000),
          queryString,
        })
      );

      const otp = await this.getOtpQueryResults(query);

      if (otp) return otp;

      await setTimeout(30_000);
    }
  }

  private async getOtpQueryResults({ queryId }: StartQueryCommandOutput) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const { results = [], status } = await this.cloudwatch.send(
        new GetQueryResultsCommand({ queryId })
      );

      if (status === 'Complete') {
        return results.flat().find(({ field }) => field === 'otp')?.value ?? '';
      } else if (status === 'Scheduled' || status === 'Running') {
        await setTimeout(1000);
      } else {
        throw new Error(`CloudWatch Logs query failed with status ${status}`);
      }
    }
  }

  private async delete(keys: ContactDetailKey[]) {
    const dbChunks = chunk(keys);

    await Promise.all(
      dbChunks.map((batch) =>
        this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.CONTACT_DETAILS_TABLE_NAME]: batch.map((key) => ({
                DeleteRequest: {
                  Key: {
                    PK: `CLIENT#${key.clientId}`,
                    SK: `${key.type}#${key.value}`,
                  },
                },
              })),
            },
          })
        )
      )
    );
  }
}
