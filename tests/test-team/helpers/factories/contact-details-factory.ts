import { randomUUID } from 'node:crypto';

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
