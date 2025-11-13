import { createHandler } from './api/delete-failed-scanned-object';
import { letterFileRepositoryContainer } from './container/letter-file-repository';

export const handler = createHandler(letterFileRepositoryContainer());
