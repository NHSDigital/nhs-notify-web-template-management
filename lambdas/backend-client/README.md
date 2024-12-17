# Backend-client

Contains all the type definitions used in `lambdas/backend-api/src`.

The intention for this package is that any types that are needed between the `web-ui` and `backend-api` should live in this package.

## Generated types

We're generating the Typescript types via the schemas specified in [spec.tmpl.json](../../infrastructure/terraform/modules/backend-api/spec.tmpl.json).

The intention here is to use a single source of truth for our type definitions and using an openapi3 spec seems reasonable.

Run the following command to generate new types:

```bash
npm run generate-dependencies
```
