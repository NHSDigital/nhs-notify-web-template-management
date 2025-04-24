import { createHandler } from './api/sftp-poll';
import { createContainer } from './container-poll';

export const handler = createHandler(createContainer());
