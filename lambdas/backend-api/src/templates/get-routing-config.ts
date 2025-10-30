import { createHandler } from './api/get-routing-config';
import { routingConfigContainer } from './container';

export const handler = createHandler(routingConfigContainer());
