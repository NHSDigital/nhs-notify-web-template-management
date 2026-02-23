import { ClientConfiguration, ClientFeatures } from 'nhs-notify-backend-client';

export const FEATURES: (keyof ClientFeatures)[] = [
  'digitalProofingEmail',
  'digitalProofingNhsApp',
  'digitalProofingSms',
  'letterAuthoring',
  'proofing',
  'routing',
];

export const initialFeatureFlags: ClientFeatures = Object.fromEntries(
  FEATURES.map((key) => [key, false])
) as ClientFeatures;

export const getCampaignIds = (client: ClientConfiguration | null) => {
  if (!client?.campaignIds) return [];

  return [...new Set(client.campaignIds)].sort();
};
