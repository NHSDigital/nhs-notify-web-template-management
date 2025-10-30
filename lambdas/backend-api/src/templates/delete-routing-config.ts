import { createHandler } from './api/delete-routing-config';
import { routingConfigContainer } from './container/routing-config';

export const handler = createHandler(routingConfigContainer());
