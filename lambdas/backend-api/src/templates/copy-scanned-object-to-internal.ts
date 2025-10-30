import { createHandler } from './api/copy-scanned-object-to-internal';
import { letterFileRepositoryContainer } from './container';

export const handler = createHandler(letterFileRepositoryContainer());
