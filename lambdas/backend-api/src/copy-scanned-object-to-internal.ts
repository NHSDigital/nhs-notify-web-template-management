import { createHandler } from './api/copy-scanned-object-to-internal';
import { letterFileRepositoryContainer } from './container/letter-file-repository';

export const handler = createHandler(letterFileRepositoryContainer());
