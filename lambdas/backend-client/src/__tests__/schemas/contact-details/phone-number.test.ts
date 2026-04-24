import { parsePhoneNumber } from '../../../schemas/contact-details/phone-number';

describe('parsePhoneNumber', () => {
  describe('parses to E.164 format phone number', () => {
    test.each([
      ['7723456789', '+447723456789'],
      ['07723456789', '+447723456789'],
      ['07723 456789', '+447723456789'],
      ['07723-456-789', '+447723456789'],
      ['00447723456789', '+447723456789'],
      ['00 44 7723456789', '+447723456789'],
      ['+447723456789', '+447723456789'],
      ['+44 7723 456 789', '+447723456789'],
      ['+44 (0)7723 456 789', '+447723456789'],
      ['\u200B\t\t+44 (0)7723 456 789\uFEFF \r\n', '+447723456789'],
    ])('valid UK mobile number %s', (input, expected) => {
      expect(parsePhoneNumber(input)).toEqual(expected);
    });

    test.each([
      ['07781123456', '+447781123456'], // Guernsey
      ['07839123456', '+447839123456'], // Guernsey
      ['07911123456', '+447911123456'], // Guernsey
      ['07509123456', '+447509123456'], // Jersey
      ['07797123456', '+447797123456'], // Jersey
      ['07937123456', '+447937123456'], // Jersey
      ['07700123456', '+447700123456'], // Jersey
      ['07829123456', '+447829123456'], // Jersey
      ['07624123456', '+447624123456'], // Isle of Man
      ['07524123456', '+447524123456'], // Isle of Man
      ['07924123456', '+447924123456'], // Isle of Man
    ])('valid crown dependency mobile number %s', (input, expected) => {
      expect(parsePhoneNumber(input)).toEqual(expected);
    });
  });

  describe('fails validation', () => {
    test.each([
      '+7 (8) (495) 123-45-67',
      '007 (8) (495) 123-45-67',
      '784951234567',
      '1-202-555-0104',
      '+12025550104',
      '0012025550104',
      '+0012025550104',
      '230 5 2512345',
      '+682 50 123',
      '+33122334455',
      '0033122334455',
      '+43 676 111 222 333 4',
      '20-12-1234-1234',
      '00201212341234',
      '16644913789',
      '77234567890',
      '+23052512345',
    ])('valid international mobile number %s', (phoneNumber: string) => {
      expect(parsePhoneNumber(phoneNumber)).toEqual(null);
    });

    test.each([
      ' ',
      '772345678910',
      '0772345678910',
      '0044772345678910',
      '0044772345678910',
      '+44 (0)7723 456 789 10',
      '0772345678',
      '004477234567',
      '00447723456',
      '+44 (0)7723 456 78',
      '07890x32109',
      '07723 456789...',
      '...07723 456789',
      '07723 456789⬆☞☝',
      '07723 ☟☜⬇⬆☞☝',
      '07723☟☜⬇⬆☞☝',
      '07";DROP TABLE;"',
      '+44 07ab cde fgh',
      'ALPHANUM3R1C',
    ])('invalid UK mobile number %s', (phoneNumber) => {
      expect(parsePhoneNumber(phoneNumber)).toEqual(null);
    });

    test.each([
      '0117 496 0860',
      '0044 117 496 0860',
      '44 117 496 0860',
      '+44 117 496 0860',
      '016064 1234',
      '020 7946 0991',
      '030 1234 5678',
      '0550 123 4567',
    ])('valid UK landline number %s', (phoneNumber) => {
      expect(parsePhoneNumber(phoneNumber)).toEqual(null);
    });

    test.each([
      '0400 123 4567',
      '0600 123 4567',
      '0300 46 46',
      '0800 11 12',
      '0845 46 31',
      '0845 46 46',
      '0900 123 4567',
    ])('invalid UK landline number %s', (phoneNumber) => {
      expect(parsePhoneNumber(phoneNumber)).toEqual(null);
    });

    test.each([
      '80100000000',
      '1234567',
      '+682 1234',
      '+12345 12345 12345 6',
      '0033877123456',
    ])('invalid international number %s', (phoneNumber) => {
      expect(parsePhoneNumber(phoneNumber)).toEqual(null);
    });

    test.each(['07700900010', '447700900020', '+447700900030'])(
      'number used for television programmes %s',
      (phoneNumber) => {
        expect(parsePhoneNumber(phoneNumber)).toEqual(null);
      }
    );
  });
});
