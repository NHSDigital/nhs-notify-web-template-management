// https://nextjs.org/docs/app/building-your-application/testing/jest#optional-extend-jest-with-custom-matchers
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';
/*
 * A polyfill for fetch API which includes the Request object
 * this helps solve the issue of the test throwing an error if the `getAmplifyBackendClient` is not mocked out.
 * https://github.com/vercel/next.js/discussions/59041#discussioncomment-10043081
 */
import 'whatwg-fetch';

Object.assign(global, { TextDecoder, TextEncoder });
