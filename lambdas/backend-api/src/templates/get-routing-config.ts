import { createHandler } from './api/get-routing-config';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
