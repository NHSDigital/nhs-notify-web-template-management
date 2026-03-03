import { createHandler } from './api/forward-initial-render-request';
import { renderQueueContainer } from './container/render-queue';

export const handler = createHandler(renderQueueContainer());
