import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../infrastructure/terraform/modules/backend-api/spec.tmpl.json',
  output: {
    path: './src',
    case: 'preserve',
    postProcess: ['eslint', 'prettier'],
  },
  plugins: ['@hey-api/typescript'],
});
