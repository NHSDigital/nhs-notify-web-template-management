import { IUseCase } from './use-case-orchestrator';
import { EventBridgeHelper } from '../eventbridge/eventbridge-helper';
import { S3Helper } from '../s3/s3-helper';

type Config = {
  templateId: string;
  templateOwner: string;
  files: Array<{
    name?: string;
    currentVersion?: string;
    eventType: 'THREATS_FOUND' | 'NO_THREATS_FOUND' | 'UNSUPPORTED';
  }>;
};

export class SimulateGuardDutyScan implements IUseCase<void> {
  readonly #eventBridgeHelper: EventBridgeHelper;
  readonly #s3Helper: S3Helper;
  readonly #config: Config;

  constructor(config: Config) {
    this.#config = config;
    this.#eventBridgeHelper = new EventBridgeHelper();
    this.#s3Helper = new S3Helper();
  }

  async execute() {
    for (const file of this.#config.files) {
      if (!file.name || !file.currentVersion) {
        throw new Error('No file name or file currentVersion', {
          cause: file,
        });
      }

      const s3FilePath = this.s3ObjectPath(file.name, file.currentVersion);

      const s3VersionId = await this.#s3Helper.getVersionId(
        process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
        s3FilePath
      );

      if (!s3VersionId) {
        throw new Error(`Unable to get versionId for ${s3FilePath}`);
      }

      this.#eventBridgeHelper.publishGuardDutyEvent(
        s3FilePath,
        s3VersionId,
        file.eventType
      );
    }
  }

  private s3ObjectPath(file: string, versionId: string) {
    return `${this.parentFolderByFileType(file)}/${this.#config.templateOwner}/${this.#config.templateId}/${versionId}/${file}`;
  }

  private parentFolderByFileType(file: string) {
    return file.endsWith('.pdf') ? 'pdf-template' : 'csv-test-data';
  }
}
