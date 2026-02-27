import { createHandler } from './api/upload-docx-letter';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
