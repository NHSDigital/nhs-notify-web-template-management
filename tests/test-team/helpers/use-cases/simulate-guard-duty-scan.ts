import {
  EventBridgeHelper,
  GuardDutyScanResult,
} from '../eventbridge/eventbridge-helper';
import { S3Helper } from '../s3/s3-helper';

type TemplateKey = { owner: string; id: string };

type S3GuardDutyEvent = {
  key: TemplateKey;
  type: GuardDutyScanResult;
  fileName?: string;
  fileType: 'csv' | 'pdf';
};

export class SimulateGuardDutyScan {
  readonly #eventBridgeHelper: EventBridgeHelper;
  readonly #s3Helper: S3Helper;

  constructor() {
    this.#eventBridgeHelper = new EventBridgeHelper();
    this.#s3Helper = new S3Helper();
  }

  async publish(event: S3GuardDutyEvent): Promise<boolean> {
    if (!event.fileName) {
      throw new Error('No file name', {
        cause: event,
      });
    }

    const s3FilePath = this.s3ObjectPath(
      event.key,
      event.fileName,
      event.fileType
    );

    const s3VersionId = await this.#s3Helper.getVersionId(
      process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
      s3FilePath
    );

    if (!s3VersionId) {
      throw new Error(`Unable to get S3 versionId for ${s3FilePath}`);
    }

    this.#eventBridgeHelper.publishGuardDutyEvent(
      s3FilePath,
      s3VersionId,
      event.type
    );

    return true;
  }

  private s3ObjectPath(
    key: TemplateKey,
    fileName: string,
    fileType: 'pdf' | 'csv'
  ) {
    const parentFolder = fileType === 'pdf' ? 'pdf-template' : 'test-data';

    return `${parentFolder}/${key.owner}/${key.id}/${fileName}.${fileType}`;
  }
}
