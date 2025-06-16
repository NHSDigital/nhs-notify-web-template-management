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

    return true;
  }

  private createGuardDutyEvent(
    s3ObjectKey: string,
    scanResultStatus: GuardDutyScanResult,
    versionId: string
  ) {
    const DETAIL_TYPE = 'GuardDuty Malware Protection Object Scan Result';
    const RESOURCE = 'test:guardduty';
    const SOURCE = 'test.guardduty';

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
          eTag: `etag-${Date.now()}`,
          versionId: versionId,
        },
      }),
      Resources: [RESOURCE],
    };
  }
}
