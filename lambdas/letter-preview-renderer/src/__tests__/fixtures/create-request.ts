import type {
  InitialRenderRequest,
  PersonalisedRenderRequest,
  ShortPersonalisedRenderRequest,
  LongPersonalisedRenderRequest,
} from 'nhs-notify-backend-client/src/types/render-request';

export const createInitialRequest = (
  overrides: Partial<Omit<InitialRenderRequest, 'requestType'>> = {}
): InitialRenderRequest => ({
  requestType: 'initial',
  clientId: 'test-client',
  templateId: 'test-template',
  docxCurrentVersion: 'test-version',
  ...overrides,
});

export const createPersonalisedRequest = (
  overrides: Partial<
    Omit<ShortPersonalisedRenderRequest, 'requestType' | 'requestTypeVariant'>
  > = {}
): ShortPersonalisedRenderRequest => ({
  requestType: 'personalised',
  requestTypeVariant: 'short',
  clientId: 'test-client',
  templateId: 'test-template',
  docxCurrentVersion: 'test-version',
  personalisation: { first_name: 'Test' },
  systemPersonalisationPackId: 'test-pack-id',
  lockNumber: 1,
  ...overrides,
});

export const createLongPersonalisedRequest = (
  overrides: Partial<
    Omit<LongPersonalisedRenderRequest, 'requestType' | 'requestTypeVariant'>
  > = {}
): LongPersonalisedRenderRequest => ({
  requestType: 'personalised',
  requestTypeVariant: 'long',
  clientId: 'test-client',
  templateId: 'test-template',
  docxCurrentVersion: 'test-version',
  personalisation: { full_address: '123 Test Street' },
  systemPersonalisationPackId: 'test-pack-id',
  lockNumber: 1,
  ...overrides,
});
