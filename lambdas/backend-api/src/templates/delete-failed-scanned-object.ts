import { createHandler } from './api/delete-failed-scanned-object';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
