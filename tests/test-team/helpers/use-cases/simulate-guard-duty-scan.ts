import { IUseCase } from './use-case-orchestrator';
import {
  EventBridgeHelper,
  GuardDutyScanResult,
} from '../eventbridge/eventbridge-helper';
import { S3Helper } from '../s3/s3-helper';
import { Template } from '../types';

type FileConfig = {
  currentVersion?: string;
  event: GuardDutyScanResult;
  type: 'pdf' | 'csv';
};

type Config = {
  templateId: string;
  templateOwner: string;
  files: FileConfig[];
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
      if (!file.currentVersion) {
        throw new Error('No file name or file currentVersion', {
          cause: file,
        });
      }

      const s3FilePath = this.s3ObjectPath(file.type, file.currentVersion);

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
        file.event
      );
    }
  }

  private s3ObjectPath(fileType: 'pdf' | 'csv', versionId: string) {
    const parentFolder = fileType === 'pdf' ? 'pdf-template' : 'test-data';

    return `${parentFolder}/${this.#config.templateOwner}/${this.#config.templateId}/${versionId}.${fileType}`;
  }

  static async publish(
    template: Template,
    events: {
      pdfTemplateEvent?: GuardDutyScanResult;
      csvTestDataEvent?: GuardDutyScanResult;
    }
  ) {
    const files: FileConfig[] = [];

    if (events.pdfTemplateEvent) {
      files.push({
        currentVersion: template.files?.pdfTemplate?.currentVersion,
        event: events.pdfTemplateEvent,
        type: 'pdf',
      });
    }

    if (events.csvTestDataEvent) {
      files.push({
        currentVersion: template.files?.pdfTemplate?.currentVersion,
        event: events.csvTestDataEvent,
        type: 'csv',
      });
    }

    await new SimulateGuardDutyScan({
      templateId: template.id,
      templateOwner: template.owner,
      files,
    }).execute();
  }
}
