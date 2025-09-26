import { ClientFeatures } from 'nhs-notify-backend-client';

export const FEATURES: (keyof ClientFeatures)[] = ['proofing', 'routing'];

export const initialFeatureFlags: ClientFeatures = Object.fromEntries(
  FEATURES.map((key) => [key, false])
) as ClientFeatures;
