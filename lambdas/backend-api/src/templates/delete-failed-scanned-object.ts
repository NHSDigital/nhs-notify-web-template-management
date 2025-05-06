import { createHandler } from './api/delete-failed-scanned-object';
import { createLetterFileRepositoryContainer } from './container';

export const handler = createHandler(createLetterFileRepositoryContainer());
