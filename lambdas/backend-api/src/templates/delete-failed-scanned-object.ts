import { createHandler } from './api/delete-failed-scanned-object';
import { letterFileRepositoryContainer } from './container';

export const handler = createHandler(letterFileRepositoryContainer());
