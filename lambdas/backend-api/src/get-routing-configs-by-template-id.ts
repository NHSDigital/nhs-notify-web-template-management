import { createHandler } from './api/get-routing-configs-by-template-id';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
