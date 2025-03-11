# Backend-api

Template UI backend APIs

## Template APIs

The openapi3 spec can found in the `terraform` module in [spec.tmpl.json](../../infrastructure/terraform/modules/backend-api/spec.tmpl.json).

If you have postman installed you can import the `spec` file and make request via postman.

## Get an Access token

Setup an authenticated AWS terminal and run

```bash
./scripts/auth_sandbox.sh <email> <password>
```

Grab the `AccessToken` from `sandbox_cognito_auth_token.json`

### GET - /v1/template/:templateId - Get a single template by id

Get a single template by id

```bash
curl --location 'https://<apig_id>.execute-api.eu-west-2.amazonaws.com/main/v1/template' \
--header 'Accept: application/json' \
--header 'Authorization: ••••••'
```

### POST - /v1/template/:templateId - Update a template

Will update a template

```bash
curl --location 'https://<apig_id>.execute-api.eu-west-2.amazonaws.com/main/v1/template/<string>' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: ••••••' \
--data '{
  "templateStatus": "SUBMITTED",
  "name": "<string>",
  "message": "<string>",
  "templateType": "SMS",
  "subject": "<string>"
}'
```

### GET - /v1/templates - Get all templates

currently limited to 50 items

```bash
curl --location 'https://<apig_id>.execute-api.eu-west-2.amazonaws.com/main/v1/templates' \
--header 'Accept: application/json' \
--header 'Authorization: ••••••'
```

### POST - /v1/template - Create a template

Will create a single template.

```bash
curl --location 'https://<apig_id>.execute-api.eu-west-2.amazonaws.com/main/v1/template' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: ••••••' \
--data '{
  "templateType": "EMAIL",
  "name": "<string>",
  "message": "<string>",
  "subject": "<string>"
}'
```

### POST - /v1/letter-template - Create a letter template

Will create a single letter template. The CSV form part is optional.

```bash
curl --location 'https://<apig_id>.execute-api.eu-west-2.amazonaws.com/<env>/v1/letter-template' \
--header 'Accept: application/json' \
--header 'Authorization: ••••••' \
--form 'letterPdf=@<path_to_pdf>;type=application/pdf;filename=<string>' \
--form 'testCsv=@<path_to_csv>;type=text/csv;filename=<string>' \
--form 'template={
  "templateType": "LETTER",
  "name": "<string>",
  "letterType": "x0",
  "language": "en"
}'
```
