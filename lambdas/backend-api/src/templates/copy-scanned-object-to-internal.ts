import { createHandler } from './api/copy-scanned-object-to-internal';
import { createLetterFileRepositoryContainer } from './container';

export const handler = createHandler(createLetterFileRepositoryContainer());
