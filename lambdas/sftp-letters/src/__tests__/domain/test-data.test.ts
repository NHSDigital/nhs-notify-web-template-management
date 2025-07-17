import { parseExamplePersonalisation } from '../../domain/test-data';

const testDataCsv = `Personalisation field,Short length data example,Medium length data example,Long length data example
appointment_date,Monday 1 May 2025,Saturday 10 April 2025,Wednesday 10 September 2025
appointment_time,1:56pm,11:56am,12:56pm
appointment_location,"The Epping Breast Screening Unit, St Margaret's Hospital, The Plain, Epping, Essex, CM16 6TN","The Royal Shrewsbury Hospital, Breast Screening Office, Treatment Centre, Mytton Oak Road, Shrewsbury, SY3 8XQ","City, Sandwell & Walsall BSS, The Rosewood Centre, Sandwell & West Birmingham Hospitals NHS Trust, The Birmingham Treatment Centre, City Hospital, Dudley Road, Birmingham, B18 7QH"
contact_telephone_number,020 3299 9010,020 3299 9010,020 3299 9010
`;

const testDataCsvInvalid = `parameter,short example,medium example,long example
appointment_date,Wednesday 10 September 2025
appointment_time,12:56pm,11:56am,1:56pm
`;

describe('parseExamplePersonalisation', () => {
  test('parses valid test data', () => {
    expect(parseExamplePersonalisation(testDataCsv)).toEqual([
      {
        appointment_date: 'Monday 1 May 2025',
        appointment_location:
          "The Epping Breast Screening Unit, St Margaret's Hospital, The Plain, Epping, Essex, CM16 6TN",
        appointment_time: '1:56pm',
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
        appointment_date: 'Wednesday 10 September 2025',
        appointment_location:
          'City, Sandwell & Walsall BSS, The Rosewood Centre, Sandwell & West Birmingham Hospitals NHS Trust, The Birmingham Treatment Centre, City Hospital, Dudley Road, Birmingham, B18 7QH',
        appointment_time: '12:56pm',
        contact_telephone_number: '020 3299 9010',
      },
    ]);
  });

  test('rejects invalid test data', () => {
    expect(() => parseExamplePersonalisation(testDataCsvInvalid)).toThrow(
      'Invalid Record Length: expect 4, got 2 on line 2'
    );
  });
});
