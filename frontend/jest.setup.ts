// https://nextjs.org/docs/app/building-your-application/testing/jest#optional-extend-jest-with-custom-matchers
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';
import { createMocks } from 'react-idle-timer';

/*
 * Polyfill for fetch API which includes the Request object
 * this helps solve the issue of the test throwing an error if the `getAmplifyBackendClient` is not mocked out.
 * https://github.com/vercel/next.js/discussions/59041#discussioncomment-10043081
 */
import 'whatwg-fetch';

/*
 * Polyfill for TextDecoder and TextEncoder
 * https://github.com/jsdom/jsdom/issues/2524
 */
Object.assign(global, { TextDecoder, TextEncoder });

/*
 * Polyfill for structuredClone.
 * amplify/nextjs-adapter uses this in createRunWithAmplifyServerContext by importing GlobalSettings.
 * https://github.com/jsdom/jsdom/issues/3363
 */
Object.assign(global, {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  structuredClone: (val: unknown) => JSON.parse(JSON.stringify(val)),
});

/*
 * Create mocks for react-idle-timer
 */
createMocks();

// set feature flag
process.env.NEXT_PUBLIC_ENABLE_PROOFING = 'true';
