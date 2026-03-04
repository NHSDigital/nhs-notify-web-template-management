type Common = {
  clientId: string;
  templateId: string;
  docxCurrentVersion: string;
};

export type InitialRenderRequest = Common & {
  requestType: 'initial';
};

type PersonalisedCommon = Common & {
  requestType: 'personalised';
  personalisation: Record<string, string>;
  lockNumber: number;
  systemPersonalisationPackId: string;
};

export type ShortPersonalisedRenderRequest = PersonalisedCommon & {
  requestTypeVariant: 'short';
};

export type LongPersonalisedRenderRequest = PersonalisedCommon & {
  requestTypeVariant: 'long';
};

export type PersonalisedRenderRequest =
  | ShortPersonalisedRenderRequest
  | LongPersonalisedRenderRequest;

export type RenderRequest = InitialRenderRequest | PersonalisedRenderRequest;

export type RenderRequestType = RenderRequest['requestType'];
