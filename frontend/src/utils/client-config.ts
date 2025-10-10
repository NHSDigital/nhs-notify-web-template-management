import { ClientConfiguration, ClientFeatures } from 'nhs-notify-backend-client';

export const FEATURES: (keyof ClientFeatures)[] = ['proofing', 'routing'];

export const initialFeatureFlags: ClientFeatures = Object.fromEntries(
  FEATURES.map((key) => [key, false])
) as ClientFeatures;

export const getCampaignIds = (client: ClientConfiguration | null) => {
  if (!client) return [];

  const { campaignIds, campaignId } = client;

  if (campaignIds) {
    return [...new Set(campaignIds)].sort();
  }

  if (campaignId) {
    return [campaignId];
  }

  return [];
};
