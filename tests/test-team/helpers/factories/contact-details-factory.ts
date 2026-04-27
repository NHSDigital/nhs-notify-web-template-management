import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';

export type FactoryContactDetail = {
  id: string;
  status: string;
  value: string;
  type: string;
  owner: string;
};

export const makeVerifiedContactDetail = (
  input: Pick<FactoryContactDetail, 'owner' | 'type' | 'value'>
): FactoryContactDetail => ({
  id: randomUUID(),
  status: 'VERIFIED',
  ...input,
});

export const generateEmailAddress = () =>
  faker.internet.exampleEmail().toLowerCase();

export type ContactDetailSMSLocale = 'GB' | 'GG' | 'IM' | 'JE';

export const generateMobileNumber = (locale: ContactDetailSMSLocale = 'GB') => {
  let regexp = '+4477[0-9]{8}';

  switch (locale) {
    case 'GG': {
      regexp = '+447781[0-9]{6}';
      break;
    }
    case 'IM': {
      regexp = '+447624[2-4]{1}[0-9]{5}';
      break;
    }
    case 'JE': {
      regexp = '+447509[0-9]{6}';
      break;
    }

    default: {
      break;
    }
  }

  return faker.helpers.fromRegExp(regexp);
};
