/**
 * PDS Test Recipients for letter preview personalisation.
 *
 * These are predefined example recipients with short and long form data
 * that users can select to preview how their letter will look with
 * different lengths of personalisation data.
 */

export interface PdsTestRecipient {
  id: string;
  name: string;
  data: Record<string, string>;
}

/**
 * Short form example recipients - shorter names and data
 */
export const SHORT_PDS_RECIPIENTS: PdsTestRecipient[] = [
  {
    id: 'short-1',
    name: 'Jo Blogs',
    data: {
      nhsNumber: '9728543751',
      firstName: 'Jo',
      lastName: 'Blogs',
      fullName: 'Jo Blogs',
      middleNames: '',
      namePrefix: '',
      nameSuffix: '',
      address_line_1: 'Jo Blogs',
      address_line_2: '1 High Street',
      address_line_3: 'Leeds',
      address_line_4: 'West Yorkshire',
      address_line_5: 'LS1 1AA',
      address_line_6: '',
      address_line_7: '',
    },
  },
  {
    id: 'short-2',
    name: 'Dr Li Wei',
    data: {
      nhsNumber: '9728543752',
      firstName: 'Li',
      lastName: 'Wei',
      fullName: 'Dr Li Wei',
      middleNames: '',
      namePrefix: 'Dr',
      nameSuffix: '',
      address_line_1: 'Dr Li Wei',
      address_line_2: '2 Oak Road',
      address_line_3: 'London',
      address_line_4: 'SW1A 1AA',
      address_line_5: '',
      address_line_6: '',
      address_line_7: '',
    },
  },
  {
    id: 'short-3',
    name: 'Mx Ana Kim',
    data: {
      nhsNumber: '9728543753',
      firstName: 'Ana',
      lastName: 'Kim',
      fullName: 'Mx Ana Kim',
      middleNames: '',
      namePrefix: 'Mx',
      nameSuffix: '',
      address_line_1: 'Mx Ana Kim',
      address_line_2: '3 Park Lane',
      address_line_3: 'Manchester',
      address_line_4: 'M1 1AA',
      address_line_5: '',
      address_line_6: '',
      address_line_7: '',
    },
  },
];

/**
 * Long form example recipients - longer names and data to test edge cases
 */
export const LONG_PDS_RECIPIENTS: PdsTestRecipient[] = [
  {
    id: 'long-1',
    name: 'Joseph Anthony Hendrington-Bloggs',
    data: {
      nhsNumber: '9728543761',
      firstName: 'Joseph',
      lastName: 'Hendrington-Bloggs',
      fullName: 'Mr Joseph Anthony Hendrington-Bloggs',
      middleNames: 'Anthony',
      namePrefix: 'Mr',
      nameSuffix: '',
      address_line_1: 'Mr Joseph Anthony Hendrington-Bloggs',
      address_line_2: 'Apartment 42B, The Granary Building',
      address_line_3: 'Wellington Place Business Park',
      address_line_4: 'Leeds',
      address_line_5: 'West Yorkshire',
      address_line_6: 'LS1 4AP',
      address_line_7: '',
    },
  },
  {
    id: 'long-2',
    name: 'Dr Alejandro Ruiz Fernandez',
    data: {
      nhsNumber: '9728543762',
      firstName: 'Alejandro',
      lastName: 'Ruiz Fernandez',
      fullName: 'Dr Alejandro Ruiz Fernandez',
      middleNames: '',
      namePrefix: 'Dr',
      nameSuffix: '',
      address_line_1: 'Dr Alejandro Ruiz Fernandez',
      address_line_2: 'The Old Rectory, Church Lane',
      address_line_3: 'Little Snoring-on-the-Wold',
      address_line_4: 'Gloucestershire',
      address_line_5: 'GL54 1AA',
      address_line_6: '',
      address_line_7: '',
    },
  },
  {
    id: 'long-3',
    name: 'Prof Catherine Montgomery-Harrington',
    data: {
      nhsNumber: '9728543763',
      firstName: 'Catherine',
      lastName: 'Montgomery-Harrington',
      fullName: 'Prof Catherine Elizabeth Montgomery-Harrington',
      middleNames: 'Elizabeth',
      namePrefix: 'Prof',
      nameSuffix: 'OBE',
      address_line_1: 'Prof Catherine E Montgomery-Harrington OBE',
      address_line_2: 'Flat 15, Kensington Court Apartments',
      address_line_3: 'Kensington High Street',
      address_line_4: 'Royal Borough of Kensington and Chelsea',
      address_line_5: 'London',
      address_line_6: 'W8 5NP',
      address_line_7: '',
    },
  },
];
