import { createHandler } from './api/list-routing-configs';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
