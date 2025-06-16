import { test, expect } from '@playwright/test';
import {
  EventBridgeHelper,
  GuardDutyScanResult,
} from '../helpers/eventbridge/eventbridge-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { Template, File } from '../helpers/types';

type EventConfig = {
  key: { id: string; owner: string };
  scanResult: GuardDutyScanResult;
};

type FileConfig = {
  pathPrefix: 'pdf-template' | 'test-data' | 'proofs';
  getFile: (template: Template) => File | undefined;
  getPath: (template: Template, file?: File) => string;
};

const templateStorageHelper = new TemplateStorageHelper();
const eventBridgeHelper = new EventBridgeHelper();

function assertGuardDutyEventForFile(
  event: EventConfig,
  fileConfig: FileConfig
) {
  const { key, scanResult } = event;
  const { pathPrefix, getFile, getPath } = fileConfig;

  return test.step(`when user uploads ${pathPrefix} file, then guardduty triggers ${scanResult}`, async () => {
    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      const file = getFile(template);

      const path = `${pathPrefix}/${getPath(template, file)}`;

      const metadata = await templateStorageHelper.getS3Metadata(
        process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
        path
      );

      if (!metadata?.VersionId) {
        throw new Error(`Unable to get S3 versionId for ${path}`);
      }

      const published = await eventBridgeHelper.publishGuardDutyEvent(
        path,
        metadata.VersionId,
        scanResult
      );

      expect(published).toEqual(true);
    }).toPass({ timeout: 60_000 });
  });
}

export function assertPdfTemplateGuardDutyEvent(props: EventConfig) {
  return assertGuardDutyEventForFile(props, {
    pathPrefix: 'pdf-template',
    getFile: (template) => template.files?.pdfTemplate,
    getPath: (template, file) =>
      `${template.owner}/${template.id}/${file?.currentVersion}.pdf`,
  });
}

export function assertTestDataGuardDutyEvent(props: EventConfig) {
  return assertGuardDutyEventForFile(props, {
    pathPrefix: 'test-data',
    getFile: (template) => template.files?.testDataCsv,
    getPath: (template, file) =>
      `${template.owner}/${template.id}/${file?.currentVersion}.csv`,
  });
}

export function assertProofGuardDutyEvent(
  props: EventConfig & { fileName: string }
) {
  return assertGuardDutyEventForFile(props, {
    pathPrefix: 'proofs',
    getFile: (template) => {
      const file = template.files?.proofs?.[props.fileName];

      if (file) {
        return { ...file, currentVersion: 'unknown' };
      }
    },
    getPath: () => `${props.key.id}/${props.fileName}`,
  });
}
