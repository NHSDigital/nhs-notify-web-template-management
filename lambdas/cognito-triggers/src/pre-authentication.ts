import type { PreAuthenticationTriggerEvent } from 'aws-lambda';

export const handler = async (event: PreAuthenticationTriggerEvent) => {
  if (event.request.userAttributes['custom:sbx_client_id']) return event;

  throw new Error('PRE_AUTH_NO_CLIENT_FAILURE');
};
