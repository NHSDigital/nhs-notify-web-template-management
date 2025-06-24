export type Features = {
  proofing: boolean;
};

export interface IClientConfiguration {
  campaignId?: string;
  features: Features;
}
