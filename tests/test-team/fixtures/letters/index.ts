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
    csv: getFile('with-personalisation', 'test-data.csv'),
    csvFakeVirus: getFile('with-personalisation', 'eicar-threat-test.csv'),
    csvEmptyParams: getFile('with-personalisation', 'empty-params.csv'),
    csvNonsenseParams: getFile('with-personalisation', 'nonsense.csv'),
    csvWrongParams: getFile('with-personalisation', 'wrong-params.csv'),
    passwordPdf: getFile('with-personalisation', 'password.pdf'),
    pdf: getFile('with-personalisation', 'template.pdf'),
    pdfEmptyParams: getFile('with-personalisation', 'empty-params.pdf'),
    pdfNonsenseParams: getFile('with-personalisation', 'nonsense.pdf'),
  },
  noCustomPersonalisation: {
    pdf: getFile('no-custom-personalisation', 'template.pdf'),
    passwordPdf: getFile('no-custom-personalisation', 'password.pdf'),
    pdfIncompleteAddress: getFile(
      'no-custom-personalisation',
      'incomplete-address.pdf'
    ),
  },
};

export const docxFixtures = {
  standard: getFile('docx', 'standard-english-template.docx'),
  fakeVirus: getFile('docx', 'eicar-threat-test.docx'),
  incompleteAddress: getFile('docx', 'missing-address-line.docx'),
  nonRenderableMarker: getFile('docx', 'non-renderable-marker.docx'), // contains {c.fullName}
  password: getFile('docx', 'password.docx'),
  invalidMarkers: getFile('docx', 'invalid-markers.docx'), // contains {d.parameter!}
  corrupted: getFile('docx', 'corrupted.docx'), // word/document.xml is invalid XML
  unexpectedAddressLines: getFile('docx', 'unexpected-address-lines.docx'),
};
