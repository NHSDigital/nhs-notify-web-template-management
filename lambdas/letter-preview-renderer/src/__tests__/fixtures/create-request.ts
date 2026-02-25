import type {
  InitialRenderRequest,
  ShortPersonalisedRenderRequest,
} from 'nhs-notify-backend-client/src/types/render-request';

export const createInitialRequest = (
  overrides: Partial<Omit<InitialRenderRequest, 'requestType'>> = {}
): InitialRenderRequest => ({
  requestType: 'initial',
  clientId: 'test-client',
  templateId: 'test-template',
  currentVersion: 'test-version',
  ...overrides,
});

export const createPersonalisedRequest = (
  overrides: Partial<Omit<ShortPersonalisedRenderRequest, 'requestType'>> = {}
): ShortPersonalisedRenderRequest => ({
  requestType: 'personalised',
  requestTypeVariant: 'short',
  clientId: 'test-client',
  templateId: 'test-template',
  currentVersion: 'test-version',
  personalisation: { first_name: 'Test' },
  lockNumber: 1,
  ...overrides,
});
