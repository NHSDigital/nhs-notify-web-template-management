import { randomUUID } from 'node:crypto';

export type FactoryContactDetail = {
  id: string;
  status: string;
  value: string;
  type: string;
  clientId: string;
};

export const makeVerifiedContactDetail = (
  input: Pick<FactoryContactDetail, 'clientId' | 'type' | 'value'>
): FactoryContactDetail => ({
  id: randomUUID(),
  status: 'VERIFIED',
  ...input,
});
