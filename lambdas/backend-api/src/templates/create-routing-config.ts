import { createHandler } from './api/create-routing-config';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
