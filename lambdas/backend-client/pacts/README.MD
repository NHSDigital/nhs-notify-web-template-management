# Contract testing pact Notes

## Pacts

This folder comntains the consumer cretaed contracts (pacts) these are created from lambdas/backend-client/src/__tests__/api.pact.spec.ts

## Verifier

This is a unit test which runs against
This runs against the api /lambdas/backend-api/src/__tests__/templates/api/api.pact.test.ts and verifies the pacts generated from the client.

## Bi-directional contract testing

This verifies that the consumer tests are comptibale with the provider OAS spec  infrastructure/terraform/modules/backend-api/spec.tmpl.json

This bi-directional contract testing is only available as SAAS see <https://pactflow.io/oss/>

See <https://docs.pactflow.io/docs/bi-directional-contract-testing>
