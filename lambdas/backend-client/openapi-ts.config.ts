import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../infrastructure/terraform/modules/backend-api/spec.tmpl.json',
  output: {
    path: './src/types/generated',
    case: 'preserve',
    format: 'prettier',
    lint: 'eslint',
  },
  plugins: ['@hey-api/typescript'],
});
