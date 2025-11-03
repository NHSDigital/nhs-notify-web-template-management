import { createHandler } from './api/count-routing-configs';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
