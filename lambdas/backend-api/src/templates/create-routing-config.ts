import { createHandler } from './api/create-routing-config';
import { routingConfigContainer } from './container';

export const handler = createHandler(routingConfigContainer());
