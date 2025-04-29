import { createHandler } from './api/proof';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
