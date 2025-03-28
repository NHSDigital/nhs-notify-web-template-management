/* eslint-disable security/detect-non-literal-fs-filename */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const files = new Map<string, { data: Buffer; checksumSha256: string }>();

const loadFile = (filepath: string) => {
  const data = readFileSync(filepath);
  const checksumSha256 = sha256(data);
  const file = { data, checksumSha256 };
  files.set(filepath, file);
  return file;
};

const sha256 = (data: Buffer) =>
  createHash('sha256').update(data).digest('base64');

const getFile = (directory: string, filename: string) => {
  const filepath = path.resolve(__dirname, directory, filename);

  return {
    filepath,
    open: () => {
      const opened = files.get(filepath);

      if (opened) {
        return opened.data;
      }

      return loadFile(filepath).data;
    },
    checksumSha256: () => {
      const opened = files.get(filepath);
      if (opened) {
        return opened.checksumSha256;
      }

      return loadFile(filepath).checksumSha256;
    },
  };
};

export const pdfUploadFixtures = {
  withPersonalisation: {
    pdf: getFile('with-personalisation', 'template.pdf'),
    csv: getFile('with-personalisation', 'test-data.csv'),
    passwordPdf: getFile('with-personalisation', 'password.pdf'),
  },
  noCustomPersonalisation: {
    pdf: getFile('no-custom-personalisation', 'template.pdf'),
    passwordPdf: getFile('no-custom-personalisation', 'password.pdf'),
  },
};
