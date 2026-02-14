type Common = {
  clientId: string;
  templateId: string;
};

export type InitialRenderRequest = Common & {
  requestType: 'initial';
};

export type PersonalisedRenderRequest = Common & {
  requestType: 'personalised';
};

export type RenderRequest = InitialRenderRequest | PersonalisedRenderRequest;
