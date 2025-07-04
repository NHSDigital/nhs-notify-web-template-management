import { createHandler } from './api/send-handler';
import { createContainer } from './container-request-proof';

export const handler = createHandler(createContainer());
