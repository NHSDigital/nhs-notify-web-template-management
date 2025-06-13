import { test, expect } from '@playwright/test';
import { SimulateGuardDutyScan } from '../helpers/use-cases/simulate-guard-duty-scan';
import { GuardDutyScanResult } from '../helpers/eventbridge/eventbridge-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { Template, TemplateFile } from '../helpers/types';

type EventConfig = {
  key: { id: string; owner: string };
  scanResult: GuardDutyScanResult;
};

type FileConfig = {
  pathPrefix: 'pdf-template' | 'test-data' | 'proofs';
  getFile: (template: Template) => TemplateFile | undefined;
  getPath: (template: Template, file?: TemplateFile) => string;
};

const guardDutyScan = new SimulateGuardDutyScan();
const templateStorageHelper = new TemplateStorageHelper();

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

      if (file?.virusScanStatus !== 'PENDING') {
        return true;
      }

      const path = getPath(template, file);

      const published = await guardDutyScan.publish({
        type: scanResult,
        path,
      });

      expect(published).toEqual(true);
    }).toPass({ timeout: 60_000 });
  });
}

export function assertPdfTemplateGuardDutyEvent(props: EventConfig) {
  return assertGuardDutyEventForFile(props, {
    pathPrefix: 'pdf-template',
    getFile: (template) => template.files?.pdfTemplate,
    getPath: (template, file) =>
      `pdf-template/${template.owner}/${template.id}/${file?.currentVersion}.pdf`,
  });
}

export function assertTestDataGuardDutyEvent(props: EventConfig) {
  return assertGuardDutyEventForFile(props, {
    pathPrefix: 'test-data',
    getFile: (template) => template.files?.testDataCsv,
    getPath: (template, file) =>
      `test-data/${template.owner}/${template.id}/${file?.currentVersion}.csv`,
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
    getPath: () => `proofs/${props.key.id}/${props.fileName}`,
  });
}
