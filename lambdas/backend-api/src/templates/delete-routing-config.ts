import { createHandler } from './api/delete-routing-config';
import { routingConfigContainer } from './container';

export const handler = createHandler(routingConfigContainer());
