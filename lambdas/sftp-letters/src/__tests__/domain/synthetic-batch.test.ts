import { SyntheticBatch } from '../../domain/synthetic-batch';

describe('SyntheticBatch', () => {
  describe('buildBatch', () => {
    test('merges mock PDS data, user test data, and other details into a synthetic batch', () => {
      let mockIdIdx = 0;
      const mockGenerateId = () => {
        mockIdIdx += 1;
        return mockIdIdx.toString();
      };

      const syntheticBatch = new SyntheticBatch(
        mockGenerateId,
        () => new Date('2025-04-10T07:38:41.502Z')
      );

      const userData = [
        { userData1: 'a', userData2: 'b' },
        { userData1: 'c d', userData2: 'e f' },
        { userData1: 'ghi', userData2: 'jklmn' },
      ];

      const templateId = '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8';

      const fieldsInTemplate = [
        'date',
        'nhsNumber',
        'fullName',
        'firstName',
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
        'userData1',
        'userData2',
      ];

      const batch = syntheticBatch.buildBatch(
        templateId,
        fieldsInTemplate,
        userData
      );

      expect(batch).toEqual([
        {
          address_line_1: 'Ms A A AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          address_line_2: '14 Dean Garden Rise',
          address_line_3: '?!""#$%&\'()*+,-./0123456789',
          address_line_4: 'HIGH WYCOMBE:;<=',
          address_line_5: 'HP11 1RE',
          address_line_6: '',
          address_line_7: '',
          clientRef: '1_2_2025 08:38:41 GMT+0100 (British Summer Time)',
          date: '10 April 2025',
          firstName: 'AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          fullName:
            'Ms AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          nhsNumber: '9464416181',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          userData1: 'a',
          userData2: 'b',
        },
        {
          address_line_1: 'MR John Barry LESTER',
          address_line_2: '1 PAUL LANE',
          address_line_3: 'APPLEBY',
          address_line_4: 'SCUNTHORPE',
          address_line_5: 'S HUMBERSIDE',
          address_line_6: 'DN15 0AR',
          address_line_7: '',
          clientRef: '1_2_ 2025 08:38:41 GMT+0100 (British Summer Time)',
          date: '10 April 2025',
          firstName: 'John',
          fullName: 'MR John Barry LESTER',
          nhsNumber: '9728543417',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          userData1: 'c d',
          userData2: 'e f',
        },
        {
          address_line_1: 'MR Louie NAPIER',
          address_line_2: 'c/o Wayne Shirt (CM Test)',
          address_line_3: '6th Floor',
          address_line_4: '7&8 Wellington Place',
          address_line_5: 'Leeds',
          address_line_6: 'West Yorkshire',
          address_line_7: 'LS1 4AP',
          clientRef: '1_2_ 2025 08:38:41 GMT+0100 (British Summer Time)',
          date: '10 April 2025',
          firstName: 'Louie',
          fullName: 'MR Louie NAPIER',
          nhsNumber: '9728543751',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          userData1: 'ghi',
          userData2: 'jklmn',
        },
      ]);
    });
  });
});
