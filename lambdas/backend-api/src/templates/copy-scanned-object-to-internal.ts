import { createHandler } from './api/copy-scanned-object-to-internal';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
