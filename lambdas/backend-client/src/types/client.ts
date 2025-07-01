export type Features = {
  proofing: boolean;
};

export type NotifyClient = {
  campaignId?: string;
  features: Features;
};
