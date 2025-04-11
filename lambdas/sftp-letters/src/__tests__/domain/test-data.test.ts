/* eslint-disable security/detect-non-literal-fs-filename */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseTestPersonalisation } from '../../domain/test-data';

const testDataCsv = readFileSync(
  path.resolve(__dirname, '..', 'fixtures', 'test-data.csv'),
  'utf8'
);
const testDataCsvInvalid = readFileSync(
  path.resolve(__dirname, '..', 'fixtures', 'test-data-invalid.csv'),
  'utf8'
);

describe('parseTestPersonalisation', () => {
  test('parses valid test data', () => {
    expect(parseTestPersonalisation(testDataCsv)).toEqual([
      {
        appointment_date: 'Wednesday 10 September 2025',
        appointment_location:
          'City, Sandwell & Walsall BSS, The Rosewood Centre, Sandwell & West Birmingham Hospitals NHS Trust, The Birmingham Treatment Centre, City Hospital, Dudley Road, Birmingham, B18 7QH',
        appointment_time: '12:56pm',
        contact_telephone_number: '020 3299 9010',
      },
      {
        appointment_date: 'Saturday 10 April 2025',
        appointment_location:
          'The Royal Shrewsbury Hospital, Breast Screening Office, Treatment Centre, Mytton Oak Road, Shrewsbury, SY3 8XQ',
        appointment_time: '11:56am',
        contact_telephone_number: '020 3299 9010',
      },
      {
        appointment_date: 'Monday 1 May 2025',
        appointment_location:
          "The Epping Breast Screening Unit, St Margaret's Hospital, The Plain, Epping, Essex, CM16 6TN",
        appointment_time: '1:56pm',
        contact_telephone_number: '020 3299 9010',
      },
    ]);
  });

  test('rejects invalid test data', () => {
    expect(() => parseTestPersonalisation(testDataCsvInvalid)).toThrow(
      'Invalid Record Length: expect 4, got 2 on line 2'
    );
  });
});
