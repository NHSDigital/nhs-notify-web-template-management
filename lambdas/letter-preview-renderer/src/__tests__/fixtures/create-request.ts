import type {
  InitialRenderRequest,
  PersonalisedRenderRequest,
} from 'nhs-notify-backend-client/types';

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
  overrides: Partial<Omit<PersonalisedRenderRequest, 'requestType'>> = {}
): PersonalisedRenderRequest => ({
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
