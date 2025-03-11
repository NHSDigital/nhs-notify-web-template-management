/* eslint-disable security/detect-non-literal-fs-filename */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const getFile = (directory: string, filename: string) =>
  readFileSync(path.resolve(__dirname, directory, filename));

export const pdfUploadFixtures = {
  withPersonalisation: {
    pdf: getFile('with-personalisation', 'template.pdf'),
    csv: getFile('with-personalisation', 'test-data.csv'),
  },
  noCustomPersonalisation: {
    pdf: getFile('no-custom-personalisation', 'template.pdf'),
  },
};
