import { $ContactDetailInputNormalized } from '../../../schemas';

describe('$ContactDetailInputNormalized', () => {
  describe('email', () => {
    test('validates and normalises the input, retaining raw input', () => {
      expect(
        $ContactDetailInputNormalized.parse({
          type: 'EMAIL',
          value: 'MICHAEL@NHS.NET',
        })
      ).toEqual({
        type: 'EMAIL',
        value: 'michael@nhs.net',
        rawValue: 'MICHAEL@NHS.NET',
      });
    });

    test('throws error if email is invalid', () => {
      const result = $ContactDetailInputNormalized.safeParse({
        type: 'EMAIL',
        value: 'notanemail',
      });

      expect(result.success).toBe(false);

      expect(result.error).toMatchSnapshot();
    });
  });

  describe('sms', () => {
    test('validates and normalises the input, retaining raw input', () => {
      expect(
        $ContactDetailInputNormalized.parse({
          type: 'SMS',
          value: '07891 012 345',
        })
      ).toEqual({
        type: 'SMS',
        value: '+447891012345',
        rawValue: '07891 012 345',
      });
    });

    test('throws error if phone number is invalid', () => {
      const result = $ContactDetailInputNormalized.safeParse({
        type: 'SMS',
        value: 'notaphonenumber',
      });

      expect(result.success).toBe(false);

      expect(result.error).toMatchSnapshot();
    });
  });

  test('throws error if type is invalid', () => {
    const result = $ContactDetailInputNormalized.safeParse({
      type: 'invalid',
      value: 'some-value',
    });

    expect(result.success).toBe(false);

    expect(result.error).toMatchSnapshot();
  });
});
