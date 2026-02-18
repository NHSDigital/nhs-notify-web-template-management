type Common = {
  clientId: string;
  templateId: string;
  currentVersion: string;
};

export type InitialRenderRequest = Common & {
  requestType: 'initial';
};

export type ShortPersonalisedRenderRequest = Common & {
  requestType: 'personalised-short';
};

export type LongPersonalisedRenderRequest = Common & {
  requestType: 'personalised-long';
};

export type PersonalisedRenderRequest =
  | ShortPersonalisedRenderRequest
  | LongPersonalisedRenderRequest;

export type RenderRequest = InitialRenderRequest | PersonalisedRenderRequest;

export type RenderRequestType = RenderRequest['requestType'];
