import { SyntheticBatch } from '../../domain/synthetic-batch';

describe('SyntheticBatch', () => {
  const templateId = '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8';

  describe('buildBatch', () => {
    test('merges mock PDS data, user test data, clientRef, template and date into a synthetic batch, when all possible non-custom fields are used', () => {
      let mockIdIdx = 0;
      const mockGenerateId = () => {
        mockIdIdx += 1;
        return mockIdIdx.toString();
      };

      const syntheticBatch = new SyntheticBatch(
        mockGenerateId,
        () => new Date('2025-04-10T07:38:41.502Z')
      );

      const userData: Array<Record<string, string>> = [
        { userData1: 'a', userData2: 'b' },
        { userData1: 'c d', userData2: '' },
      ];

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
        'userData3',
      ];

      const batch = syntheticBatch.buildBatch(
        templateId,
        fieldsInTemplate,
        userData
      );

      expect(batch).toEqual([
        {
          clientRef: '1_2_1744270721',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          date: '10 April 2025',
          nhsNumber: '9728543751',
          fullName: 'MR Louie NAPIER',
          firstName: 'Louie',
          address_line_1: 'MR Louie NAPIER',
          address_line_2: 'c/o Wayne Shirt (CM Test)',
          address_line_3: '6th Floor',
          address_line_4: '7&8 Wellington Place',
          address_line_5: 'Leeds',
          address_line_6: 'West Yorkshire',
          address_line_7: 'LS1 4AP',
          userData1: 'a',
          userData2: 'b',
          userData3: undefined,
        },
        {
          clientRef: '3_4_1744270721',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          date: '10 April 2025',
          nhsNumber: '9728543417',
          fullName: 'MR John Barry LESTER',
          firstName: 'John',
          address_line_1: 'MR John Barry LESTER',
          address_line_2: '1 PAUL LANE',
          address_line_3: 'APPLEBY',
          address_line_4: 'SCUNTHORPE',
          address_line_5: 'S HUMBERSIDE',
          address_line_6: 'DN15 0AR',
          address_line_7: '',
          userData1: 'c d',
          userData2: '',
          userData3: undefined,
        },
        {
          clientRef: '5_6_1744270721',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          date: '10 April 2025',
          nhsNumber: '9464416181',
          fullName:
            'Ms AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          firstName: 'AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          address_line_1: 'Ms A A AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          address_line_2: '14 Dean Garden Rise',
          address_line_3: '?!""#$%&\'()*+,-./0123456789',
          address_line_4: 'HIGH WYCOMBE:;<=',
          address_line_5: 'HP11 1RE',
          address_line_6: '',
          address_line_7: '',
          userData1: undefined,
          userData2: undefined,
          userData3: undefined,
        },
      ]);
    });

    test('creates a synthetic batch without custom personalisations. Unused non-custom personalisations are left out', () => {
      const syntheticBatch = new SyntheticBatch(
        () => 'id',
        () => new Date('2025-03-10T07:40:00.500Z')
      );

      const fieldsInTemplate = [
        'firstName',
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ];

      const batch = syntheticBatch.buildBatch(
        templateId,
        fieldsInTemplate,
        undefined
      );

      expect(batch).toEqual([
        {
          clientRef: 'id_id_1741592400',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          address_line_1: 'MR Louie NAPIER',
          address_line_2: 'c/o Wayne Shirt (CM Test)',
          address_line_3: '6th Floor',
          address_line_4: '7&8 Wellington Place',
          address_line_5: 'Leeds',
          address_line_6: 'West Yorkshire',
          address_line_7: 'LS1 4AP',
          firstName: 'Louie',
        },
        {
          clientRef: 'id_id_1741592400',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          address_line_1: 'MR John Barry LESTER',
          address_line_2: '1 PAUL LANE',
          address_line_3: 'APPLEBY',
          address_line_4: 'SCUNTHORPE',
          address_line_5: 'S HUMBERSIDE',
          address_line_6: 'DN15 0AR',
          address_line_7: '',
          firstName: 'John',
        },
        {
          clientRef: 'id_id_1741592400',
          template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
          firstName: 'AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          address_line_1: 'Ms A A AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
          address_line_2: '14 Dean Garden Rise',
          address_line_3: '?!""#$%&\'()*+,-./0123456789',
          address_line_4: 'HIGH WYCOMBE:;<=',
          address_line_5: 'HP11 1RE',
          address_line_6: '',
          address_line_7: '',
        },
      ]);
    });
  });

  describe('getId', () => {
    test('generates a deterministic compound batch ID based on the pdf version ID and templateId', () => {
      const syntheticBatch = new SyntheticBatch(
        () => 'id',
        () => new Date()
      );

      const pdfVersion = '51a8a9c5-ef30-42a7-bc19-dc27ba39a5d5';

      expect(syntheticBatch.getId(templateId, pdfVersion)).toBe(
        '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8-0000000000000_51a8a9c5ef3042a7bc19dc27ba3'
      );
    });
  });

  describe('getHeader', () => {
    test('returns header string based on standard fields (clientRef, template), plus personalisation list', () => {
      const syntheticBatch = new SyntheticBatch(
        () => 'id',
        () => new Date()
      );

      const fieldsInTemplate = [
        'date',
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ];

      expect(syntheticBatch.getHeader(fieldsInTemplate)).toBe(
        'clientRef,template,date,address_line_1,address_line_2,address_line_3,address_line_4,address_line_5,address_line_6,address_line_7'
      );
    });
  });

  describe('buildManifest', () => {
    test('returns manifest including a hash of the batch csv', () => {
      const syntheticBatch = new SyntheticBatch(
        () => 'id',
        () => new Date()
      );

      const row =
        '"id_id_1741592400","84755bd6-3cc1-4759-98b9-d1dbd8b3eff8","1 PAUL LANE","APPLEBY","SCUNTHORPE","S HUMBERSIDE","DN15 0AR"';

      const batchCsv = [
        'clientRef,template,date,address_line_1,address_line_2,address_line_3,address_line_4,address_line_5,address_line_6,address_line_7',
        row,
        row,
        row,
      ]
        .join('\n')
        .concat('\n');

      const batchId =
        '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8-0000000000000_51a8a9c5ef3042a7bc19dc27ba3';

      const manifest = syntheticBatch.buildManifest(
        templateId,
        batchId,
        batchCsv
      );

      expect(manifest).toEqual({
        batch:
          '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8-0000000000000_51a8a9c5ef3042a7bc19dc27ba3.csv',
        md5sum: '39a804b6e883ae52a6eca569adeffb7a',
        records: '3',
        template: '84755bd6-3cc1-4759-98b9-d1dbd8b3eff8',
      });
    });
  });
});
