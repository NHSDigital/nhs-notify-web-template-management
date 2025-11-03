import { createHandler } from './api/upload-letter';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
