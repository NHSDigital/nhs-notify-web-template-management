import { createHandler } from './api/update-routing-config';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
