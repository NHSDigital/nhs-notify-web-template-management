import { parseEmailAddress } from '../../../schemas/contact-details/email';

describe('parseEmailAddress', () => {
  describe('passes validation', () => {
    test.each([
      ['email@nhs.net', 'email@nhs.net'],
      [`l${'o'.repeat(309)}ng@nhs.net`, `l${'o'.repeat(309)}ng@nhs.net`],
      ['EMAIL@NHS.NET', 'email@nhs.net'],
      ['firstname.lastname@nhs.net', 'firstname.lastname@nhs.net'],
      ["firstname.o'lastname@nhs.net", "firstname.o'lastname@nhs.net"],
      ['firstname+lastname@nhs.net', 'firstname+lastname@nhs.net'],
      ['1234567890@nhs.net', '1234567890@nhs.net'],
      ['_______@nhs.net', '_______@nhs.net'],
      ['firstname-lastname@nhs.net', 'firstname-lastname@nhs.net'],
      ['email--double--hyphen@nhs.net', 'email--double--hyphen@nhs.net'],
      [' leadingspaces@nhs.net ', 'leadingspaces@nhs.net'],
    ])(
      'valid email address from nhs.net domain - %s',
      (emailAddress, expected) => {
        expect(parseEmailAddress(emailAddress)).toEqual(expected);
      }
    );
  });

  describe('fails validation', () => {
    test.each([
      'email@subdomain.nhs.net',
      `l${'o'.repeat(310)}ng@nhs.net`,
      '@nhs.net',
      'Outlook Contact <email@nhs.net>',
      'no-at.nhs.net',
      ';beginning-semicolon@nhs.net',
      'middle;semicolon@nhs.net',
      'trailing-semicolon@nhs.net;',
      '"email+leading-quotes@nhs.net',
      'email+middle"-quotes@nhs.net',
      '"quoted-local-part"@nhs.net',
      '"quoted@nhs.net"',
      'two-dots..in-local@nhs.net',
      'multiple@domains@nhs.net',
      'spaces in local@nhs.net',
      'pipe-in-domain@nhs.net|gov.uk',
      'comma],in-local@nhs.net',
      'comma-in-domain@,nhs.net',
      'pound-sign-in-local£@nhs.net',
      'local-with-’-apostrophe@nhs.net',
      'local-with-”-quotes@nhs.net',
      'domain-starts-with-a-dot@.nhs.net',
      'brackets(in)local@nhs.net',
      '🌈@nhs.net',
    ])('invalid nhs.net email address - %s', (emailAddress) => {
      expect(parseEmailAddress(emailAddress)).toEqual(null);
    });

    test.each([
      'email@domain.com',
      'email@domain.COM',
      'firstname.lastname@domain.com',
      "firstname.o'lastname@domain.com",
      'email@subdomain.domain.com',
      'firstname+lastname@domain.com',
      '1234567890@domain.com',
      'email@domain-one.com',
      '_______@domain.com',
      'email@domain.name',
      'email@domain.superlongtld',
      'email@domain.co.jp',
      'firstname-lastname@domain.com',
      'info@german-financial-services.vermögensberatung',
      'info@german-financial-services.reallylongarbitrarytldthatiswaytoohugejustincase',
      'email@double--hyphen.com',
      ' leadingspaces@email.com',
      'valid-punyode@xn--example-hq74f.com',
      'email@🌈example.com',
    ])('valid email address from not nhs.net domain - %s', (emailAddress) => {
      expect(parseEmailAddress(emailAddress)).toEqual(null);
    });

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
    ])('invalid email address %s', (emailAddress) => {
      expect(parseEmailAddress(emailAddress)).toEqual(null);
    });
  });
});
