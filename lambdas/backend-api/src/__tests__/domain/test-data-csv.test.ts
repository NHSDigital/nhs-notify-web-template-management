/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { TestDataCsv } from '../../domain/test-data-csv';

test('parse', async () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '../fixtures/test-data.csv')
  );
  const csv = new TestDataCsv(file);

  csv.parse();

  expect(csv.parameters).toEqual([
    'appointment_date',
    'appointment_time',
    'appointment_location',
    'contact_telephone_number',
  ]);

  expect(csv.short).toEqual([
    'Wednesday 10 September 2025',
    '12:56pm',
    'City, Sandwell & Walsall BSS, The Rosewood Centre, Sandwell & West Birmingham Hospitals NHS Trust, The Birmingham Treatment Centre, City Hospital, Dudley Road, Birmingham, B18 7QH',
    '020 3299 9010',
  ]);

  expect(csv.medium).toEqual([
    'Saturday 10 April 2025',
    '11:56am',
    'The Royal Shrewsbury Hospital, Breast Screening Office, Treatment Centre, Mytton Oak Road, Shrewsbury, SY3 8XQ',
    '020 3299 9010',
  ]);

  expect(csv.long).toEqual([
    'Monday 1 May 2025',
    '1:56pm',
    "The Epping Breast Screening Unit, St Margaret's Hospital, The Plain, Epping, Essex, CM16 6TN",
    '020 3299 9010',
  ]);
});

test('errors if parse is not called before reading personalisation', () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '../fixtures/test-data.csv')
  );

  const csv = new TestDataCsv(file);

  expect(() => csv.parameters).toThrow('CSV has not been parsed');
  expect(() => csv.short).toThrow('CSV has not been parsed');
  expect(() => csv.medium).toThrow('CSV has not been parsed');
  expect(() => csv.long).toThrow('CSV has not been parsed');
});

test.each([
  ['not a csv', '../fixtures/custom-personalisation.pdf'],
  ['wrong file headers', '../fixtures/wrong-headers.csv'],
  ['badly ordered file headers', '../fixtures/wrong-header-order.csv'],
  ['missing example', '../fixtures/missing-example.csv'],
  ['missing parameter in example', '../fixtures/missing-parameter.csv'],
])('errors if file cannot be parsed - %s', async (_title, filepath) => {
  const file = fs.readFileSync(path.resolve(__dirname, filepath));

  const csv = new TestDataCsv(file);

  expect(() => csv.parse()).toThrow();
});
