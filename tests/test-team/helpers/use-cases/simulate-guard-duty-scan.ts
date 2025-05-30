import {
  EventBridgeHelper,
  GuardDutyScanResult,
} from '../eventbridge/eventbridge-helper';
import { S3Helper } from '../s3/s3-helper';

type TemplateKey = { owner: string; id: string };

type S3GuardDutyEvent = {
  type: GuardDutyScanResult;
  path: string;
};

export class SimulateGuardDutyScan {
  readonly #eventBridgeHelper: EventBridgeHelper;
  readonly #s3Helper: S3Helper;

  constructor() {
    this.#eventBridgeHelper = new EventBridgeHelper();
    this.#s3Helper = new S3Helper();
  }

  async publish(event: S3GuardDutyEvent): Promise<boolean> {
    const s3VersionId = await this.#s3Helper.getVersionId(
      process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
      event.path
    );

    if (!s3VersionId) {
      throw new Error(`Unable to get S3 versionId for ${event.path}`);
    }

    this.#eventBridgeHelper.publishGuardDutyEvent(
      event.path,
      s3VersionId,
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
