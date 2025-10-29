import { createHandler } from './api/submit-routing-config';
import { submitRoutingConfigContainer } from './container';

export const handler = createHandler(submitRoutingConfigContainer());
