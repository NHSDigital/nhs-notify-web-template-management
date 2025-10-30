import { createHandler } from './api/upload-letter';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
