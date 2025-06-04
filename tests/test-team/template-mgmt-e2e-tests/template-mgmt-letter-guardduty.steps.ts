import { test, expect } from '@playwright/test';
import { SimulateGuardDutyScan } from '../helpers/use-cases/simulate-guard-duty-scan';
import { GuardDutyScanResult } from '../helpers/eventbridge/eventbridge-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { Template, TemplateFile } from '../helpers/types';

type AssertConfig = {
  key: { id: string; owner: string };
  scanResult: GuardDutyScanResult;
  timeout?: number;
};

type FileConfig = {
  pathPrefix: 'pdf-template' | 'test-data' | 'proofs';
  extension: '.pdf' | '.csv';
  getFile: (template: Template) => TemplateFile | undefined;
};

function assertGuardDutyEventForFile(
  { key, scanResult, timeout = 60_000 }: AssertConfig,
  { pathPrefix, extension, getFile }: FileConfig
) {
  const guardDutyScan = new SimulateGuardDutyScan();
  const templateStorageHelper = new TemplateStorageHelper();

  return test.step(`when user uploads ${pathPrefix} file, then guardduty triggers ${scanResult}`, async () => {
    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      const file = getFile(template);

      if (file?.virusScanStatus !== 'PENDING') {
        return true;
      }

      const published = await guardDutyScan.publish({
        type: scanResult,
        path: `${pathPrefix}/${template.owner}/${template.id}/${file?.currentVersion}${extension}`,
      });

      expect(published).toEqual(true);
    }).toPass({ timeout });
  });
}

export function assertPdfTemplateGuardDutyEvent(props: AssertConfig) {
  return assertGuardDutyEventForFile(props, {
    pathPrefix: 'pdf-template',
    extension: '.pdf',
    getFile: (template) => template.files?.pdfTemplate,
  });
}

export function assertTestDataGuardDutyEvent(props: AssertConfig) {
  return assertGuardDutyEventForFile(props, {
    pathPrefix: 'test-data',
    extension: '.csv',
    getFile: (template) => template.files?.testDataCsv,
  });
}

export function assertProofGuardDutyEvent(
  props: AssertConfig & { fileName: string }
) {
  const guardDutyScan = new SimulateGuardDutyScan();
  const templateStorageHelper = new TemplateStorageHelper();

  return test.step(`when user receives proof file, then guardduty triggers ${props.scanResult}`, async () => {
    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(props.key);

      const proof = template.files?.proofs?.[props.fileName];

      if (proof && proof.virusScanStatus !== 'PENDING') {
        return true;
      }

      const published = await guardDutyScan.publish({
        type: props.scanResult,
        path: `proofs/${props.key.id}/${props.fileName}`,
      });

      expect(published).toEqual(true);
    }).toPass({ timeout: 60_000 });
  });
}
