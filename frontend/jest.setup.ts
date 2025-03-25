// https://nextjs.org/docs/app/building-your-application/testing/jest#optional-extend-jest-with-custom-matchers
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';
import { createMocks } from 'react-idle-timer';

/*
 * A polyfill for fetch API which includes the Request object
 * this helps solve the issue of the test throwing an error if the `getAmplifyBackendClient` is not mocked out.
 * https://github.com/vercel/next.js/discussions/59041#discussioncomment-10043081
 */
import 'whatwg-fetch';

Object.assign(global, { TextDecoder, TextEncoder });

Object.assign(global, {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  structuredClone: (val: unknown) => JSON.parse(JSON.stringify(val)),
});

createMocks();

// set feature flag
process.env.NEXT_PUBLIC_ENABLE_LETTERS = 'true';
