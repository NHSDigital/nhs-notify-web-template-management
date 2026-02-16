export type TemplateRenderIds = {
  clientId: string;
  templateId: string;
};

type Common = {
  template: TemplateRenderIds;
};

export type InitialRenderRequest = Common & {
  requestType: 'initial';
};

export type PersonalisedRenderRequest = Common & {
  requestType: 'personalised';
};

export type RenderRequest = InitialRenderRequest | PersonalisedRenderRequest;
