import { createHandler } from './api/submit-routing-config';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
