import { version } from '../package.json';

export const [MAJOR_VERSION] = version.split('.');

export { version as VERSION };
