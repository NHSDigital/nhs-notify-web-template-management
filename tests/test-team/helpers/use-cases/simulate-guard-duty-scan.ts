import { TemplateStorageHelper } from '../db/template-storage-helper';
import {
  EventBridgeHelper,
  GuardDutyScanResult,
} from '../eventbridge/eventbridge-helper';

type TemplateKey = { owner: string; id: string };

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

  static testDataPath(key: TemplateKey, fileName?: string): string {
    return `test-data/${key.owner}/${key.id}/${fileName}.csv`;
  }

  static pdfTemplatePath(key: TemplateKey, fileName?: string): string {
    return `pdf-template/${key.owner}/${key.id}/${fileName}.pdf`;
  }

  static proofsPath(key: TemplateKey, fileName: string): string {
    return `proofs/${key.id}/${fileName}.pdf`;
  }
}
