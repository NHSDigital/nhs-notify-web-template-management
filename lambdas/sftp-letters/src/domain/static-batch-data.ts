const keys = [
  'nhsNumber',
  'firstName',
  'lastName',
  'fullName',
  'middleNames',
  'namePrefix',
  'nameSuffix',
  'address_line_1',
  'address_line_2',
  'address_line_3',
  'address_line_4',
  'address_line_5',
  'address_line_6',
  'address_line_7',
] as const;

type PdsPersonalisationKeys = typeof keys;

type PdsPersonalisationExample = Record<PdsPersonalisationKeys[number], string>;

export const staticPdsExampleData: [
  Record<string, string>,
  Record<string, string>,
  Record<string, string>,
] = [
  {
    nhsNumber: '9464416181',
    firstName: 'AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
    lastName: 'AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
    fullName:
      'Ms AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
    middleNames: 'AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
    namePrefix: 'Ms',
    nameSuffix: '',
    address_line_1: 'Ms A A AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
    address_line_2: '14 Dean Garden Rise',
    address_line_3: `?!""#$%&'()*+,-./0123456789`,
    address_line_4: 'HIGH WYCOMBE:;<=',
    address_line_5: 'HP11 1RE',
    address_line_6: '',
    address_line_7: '',
  },
  {
    nhsNumber: '9728543417',
    firstName: 'John',
    lastName: 'Barry',
    fullName: 'MR John Barry LESTER',
    middleNames: 'Barry',
    namePrefix: 'MR',
    nameSuffix: '',
    address_line_1: 'MR John Barry LESTER',
    address_line_2: '1 PAUL LANE',
    address_line_3: 'APPLEBY',
    address_line_4: 'SCUNTHORPE',
    address_line_5: 'S HUMBERSIDE',
    address_line_6: 'DN15 0AR',
    address_line_7: '',
  },
  {
    nhsNumber: '9728543751',
    firstName: 'Louie',
    lastName: 'NAPIER',
    fullName: 'MR Louie NAPIER',
    middleNames: '',
    namePrefix: 'MR',
    nameSuffix: '',
    address_line_1: 'MR Louie NAPIER',
    address_line_2: 'c/o Wayne Shirt (CM Test)',
    address_line_3: '6th Floor',
    address_line_4: '7&8 Wellington Place',
    address_line_5: 'Leeds',
    address_line_6: 'West Yorkshire',
    address_line_7: 'LS1 4AP',
  },
] satisfies [
  PdsPersonalisationExample,
  PdsPersonalisationExample,
  PdsPersonalisationExample,
];

export const pdsPersonalisationKeys: string[] = [...keys];
