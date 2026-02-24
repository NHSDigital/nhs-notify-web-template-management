import { mock } from 'jest-mock-extended';
import type { LetterVariant } from 'nhs-notify-backend-client';
import { LetterVariantClient } from '@backend-api/app/letter-variant-client';
import type { LetterVariantRepository } from '@backend-api/infra/letter-variant-repository';

const makeLetterVariant = (
  overrides: Partial<LetterVariant> = {}
): LetterVariant => ({
  id: 'variant-1',
  name: 'Standard C5',
  sheetSize: 'A4',
  maxSheets: 5,
  bothSides: true,
  printColour: 'black',
  envelopeSize: 'C5',
  dispatchTime: 'standard',
  postage: 'economy',
  status: 'PROD',
  type: 'STANDARD',
  ...overrides,
});

function setup() {
  const repo = mock<LetterVariantRepository>();

  const client = new LetterVariantClient(repo);

  return { client, mocks: { repo } };
}

test('it returns the global letter variant', async () => {
  const { client, mocks } = setup();

  const variant = makeLetterVariant();

  expect(variant.clientId).toBeUndefined();
  expect(variant.campaignId).toBeUndefined();

  mocks.repo.getById.mockResolvedValueOnce({ data: variant });

  const result = await client.get('input-id', {
    clientId: 'test-client-id',
    internalUserId: '',
  });

  expect(result.data).toEqual(variant);

  expect(mocks.repo.getById).toHaveBeenCalledWith('input-id');
});

test('it returns the client scoped letter variant', async () => {
  const { client, mocks } = setup();

  const variant = makeLetterVariant({ clientId: 'test-client-id' });

  expect(variant.clientId).toBe('test-client-id');
  expect(variant.campaignId).toBeUndefined();

  mocks.repo.getById.mockResolvedValueOnce({ data: variant });

  const result = await client.get('input-id', {
    clientId: 'test-client-id',
    internalUserId: '',
  });

  expect(result.data).toEqual(variant);

  expect(mocks.repo.getById).toHaveBeenCalledWith('input-id');
});

test('it returns the campaign scoped letter variant', async () => {
  const { client, mocks } = setup();

  const variant = makeLetterVariant({
    clientId: 'test-client-id',
    campaignId: 'test-campaign-id',
  });

  mocks.repo.getById.mockResolvedValueOnce({ data: variant });

  const result = await client.get('input-id', {
    clientId: 'test-client-id',
    internalUserId: '',
  });

  expect(result.data).toEqual(variant);

  expect(mocks.repo.getById).toHaveBeenCalledWith('input-id');
});

test('it returns the error from the repo', async () => {
  const { client, mocks } = setup();

  const error = {
    error: { errorMeta: { code: 500, description: 'Something went wrong' } },
  };

  mocks.repo.getById.mockResolvedValueOnce(error);

  const result = await client.get('input-id', {
    clientId: 'test-client-id',
    internalUserId: '',
  });

  expect(result).toEqual(error);
});

test('it returns the 404 if the found variant belongs to a different client', async () => {
  const { client, mocks } = setup();

  const variant = makeLetterVariant({ clientId: 'test-client-id' });

  expect(variant.clientId).toBe('test-client-id');
  expect(variant.campaignId).toBeUndefined();

  mocks.repo.getById.mockResolvedValueOnce({ data: variant });

  const result = await client.get('input-id', {
    clientId: 'different-client-id',
    internalUserId: '',
  });

  expect(result).toEqual({
    error: {
      errorMeta: { code: 404, description: 'Letter Variant not found' },
    },
  });
});
