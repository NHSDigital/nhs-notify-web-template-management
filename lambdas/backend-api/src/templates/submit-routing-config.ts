import { createHandler } from './api/submit-routing-config';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
