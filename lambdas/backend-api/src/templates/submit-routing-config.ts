import { createHandler } from './api/submit-routing-config';
import { routingConfigContainer } from './container';

export const handler = createHandler(routingConfigContainer());
