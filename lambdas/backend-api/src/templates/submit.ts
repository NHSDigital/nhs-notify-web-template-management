import { createHandler } from './api/submit';
import { submitTemplateContainer } from './container/submit-template';

export const handler = createHandler(submitTemplateContainer());
