import { createHandler } from './api/update-routing-config';
import { routingConfigContainer } from './container';

export const handler = createHandler(routingConfigContainer());
