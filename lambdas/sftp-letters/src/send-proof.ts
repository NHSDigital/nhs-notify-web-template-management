import { createHandler } from './api/send-handler';
import { createContainer } from './container-send';

export const handler = createHandler(createContainer());
