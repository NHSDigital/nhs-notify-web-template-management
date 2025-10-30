import { createHandler } from './api/submit';
import { submitTemplateContainer } from './container';

export const handler = createHandler(submitTemplateContainer());
