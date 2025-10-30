import { createHandler } from './api/list-routing-configs';
import { routingConfigContainer } from './container';

export const handler = createHandler(routingConfigContainer());
