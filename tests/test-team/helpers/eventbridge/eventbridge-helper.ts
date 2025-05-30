import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

export type GuardDutyScanResult =
  | 'NO_THREATS_FOUND'
  | 'THREATS_FOUND'
  | 'UNSUPPORTED';

export class EventBridgeHelper {
  readonly #client: EventBridgeClient;

  constructor() {
    this.#client = new EventBridgeClient({ region: 'eu-west-2' });
  }

  async publishGuardDutyEvent(
    s3ObjectKey: string,
    s3VersionId: string,
    guardDutyScanResultStatus: GuardDutyScanResult
  ) {
    const resp = await this.#client.send(
      new PutEventsCommand({
        Entries: [
          this.createGuardDutyEvent(
            s3ObjectKey,
            guardDutyScanResultStatus,
            s3VersionId
          ),
        ],
      })
    );

    if (resp.FailedEntryCount && resp.FailedEntryCount > 0) {
      throw new Error(
        `Failed to publish ${guardDutyScanResultStatus} event for ${s3ObjectKey}`,
        {
          cause: resp,
        }
      );
    }
  }

  private createGuardDutyEvent(
    s3ObjectKey: string,
    scanResultStatus: GuardDutyScanResult,
    versionId: string
  ) {
    const SOURCE = 'test.guardduty';
    const DETAIL_TYPE = 'GuardDuty Malware Protection Object Scan Result';

    return {
      Source: SOURCE,
      DetailType: DETAIL_TYPE,
      Detail: JSON.stringify({
        schemaVersion: '1.0',
        scanResultDetails: {
          scanResultStatus: scanResultStatus,
        },
        s3ObjectDetails: {
          bucketName: process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
          objectKey: s3ObjectKey,
          eTag: `test-etag-${Date.now()}`,
          versionId: versionId,
        },
      }),
      Resources: [process.env.TEMPLATES_GUARDDUTY_RESOURCE_ARN],
    };
  }
}
