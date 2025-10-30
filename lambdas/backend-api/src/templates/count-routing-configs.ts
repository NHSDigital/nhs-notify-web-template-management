import { createHandler } from './api/count-routing-configs';
import { routingConfigContainer } from './container';

export const handler = createHandler(routingConfigContainer());
