import { parseEmailAddress } from '../../../schemas/contact-details/email';

// This is based on the GOVUK Notify test data found at https://github.com/alphagov/notifications-utils
describe('parseEmailAddress', () => {
  describe('passes validation', () => {
    test.each([
      ['email@domain.com', 'email@domain.com'],
      ['email@domain.COM', 'email@domain.com'],
      ['firstname.lastname@domain.com', 'firstname.lastname@domain.com'],
      ["firstname.o'lastname@domain.com", "firstname.o'lastname@domain.com"],
      ['email@subdomain.domain.com', 'email@subdomain.domain.com'],
      ['firstname+lastname@domain.com', 'firstname+lastname@domain.com'],
      ['1234567890@domain.com', '1234567890@domain.com'],
      ['email@domain-one.com', 'email@domain-one.com'],
      ['_______@domain.com', '_______@domain.com'],
      ['email@domain.name', 'email@domain.name'],
      ['email@domain.superlongtld', 'email@domain.superlongtld'],
      ['email@domain.co.jp', 'email@domain.co.jp'],
      ['firstname-lastname@domain.com', 'firstname-lastname@domain.com'],
      [
        'info@german-financial-services.vermögensberatung',
        'info@german-financial-services.vermögensberatung',
      ],
      [
        'info@german-financial-services.reallylongarbitrarytldthatiswaytoohugejustincase',
        'info@german-financial-services.reallylongarbitrarytldthatiswaytoohugejustincase',
      ],
      ['email@double--hyphen.com', 'email@double--hyphen.com'],
      [' leadingspaces@email.com ', 'leadingspaces@email.com'],
      [
        'valid-punyode@xn--example-hq74f.com',
        'valid-punyode@xn--example-hq74f.com',
      ],
      ['email@🌈example.com', 'email@🌈example.com'],
      ['user@example.xn--p1ai', 'user@example.xn--p1ai'],
      ['user@test.xn--fiqs8s', 'user@test.xn--fiqs8s'],
    ])('valid email address %s', (emailAddress, expected) => {
      expect(parseEmailAddress(emailAddress)).toEqual(expected);
    });
  });

  describe('fails validation', () => {
    test.each([
      'email@123.123.123.123',
      'email@[123.123.123.123]',
      'plainaddress',
      '@no-local-part.com',
      'Outlook Contact <outlook-contact@domain.com>',
      'no-at.domain.com',
      'no-tld@domain',
      ';beginning-semicolon@domain.co.uk',
      'middle-semicolon@domain.co;uk',
      'trailing-semicolon@domain.com;',
      '"email+leading-quotes@domain.com',
      'email+middle"-quotes@domain.com',
      '"quoted-local-part"@domain.com',
      '"quoted@domain.com"',
      'lots-of-dots@domain..gov..uk',
      'two-dots..in-local@domain.com',
      'multiple@domains@domain.com',
      'spaces in local@domain.com',
      'spaces-in-domain@dom ain.com',
      'underscores-in-domain@dom_ain.com',
      'pipe-in-domain@example.com|gov.uk',
      'comma],in-local@gov.uk',
      'comma-in-domain@domain],gov.uk',
      'pound-sign-in-local£@domain.com',
      'local-with-’-apostrophe@domain.com',
      'local-with-”-quotes@domain.com',
      'domain-starts-with-a-dot@.domain.com',
      'brackets(in)local@domain.com',
      'incorrect-punycode@xn--🌈.com',
      'incorrect-punycode@xn---something.com',
      `email-too-l${'o'.repeat(296)}ng@example.com`,
      `email@${'a'.repeat(64)}.com`,
      `email@subdomain..example.com`,
    ])('invalid email address %s', (emailAddress: string) => {
      expect(parseEmailAddress(emailAddress)).toEqual(null);
    });
  });
});
