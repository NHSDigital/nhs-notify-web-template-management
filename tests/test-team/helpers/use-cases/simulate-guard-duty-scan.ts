import { TemplateStorageHelper } from '../db/template-storage-helper';
import {
  EventBridgeHelper,
  GuardDutyScanResult,
} from '../eventbridge/eventbridge-helper';

type S3GuardDutyEvent = {
  type: GuardDutyScanResult;
  path: string;
};

export class SimulateGuardDutyScan {
  readonly #eventBridgeHelper: EventBridgeHelper;
  readonly #storageHelper: TemplateStorageHelper;

  constructor() {
    this.#eventBridgeHelper = new EventBridgeHelper();
    this.#storageHelper = new TemplateStorageHelper();
  }

  async publish(event: S3GuardDutyEvent): Promise<boolean> {
    const metadata = await this.#storageHelper.getS3Metadata(
      process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
      event.path
    );

    if (!metadata?.VersionId) {
      throw new Error(`Unable to get S3 versionId for ${event.path}`);
    }

    this.#eventBridgeHelper.publishGuardDutyEvent(
      event.path,
      metadata.VersionId,
      event.type
    );

    return true;
  }
}
