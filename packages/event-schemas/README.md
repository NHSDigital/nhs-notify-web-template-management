# Template Management Event Schemas

Zod validators, TypeScript type definitions, JSON Schemas and Sample Events for events emitted by Template Management service

## Installation

To install this package from GitHub package registry, you will need to configure an `.npmrc` file with the following:

```txt
//npm.pkg.github.com/:_authToken=<GITHUB_TOKEN>
@nhsdigital:registry=https://npm.pkg.github.com
```

where `GITHUB_TOKEN` is a classic PAT with the `packages:read` scope.

Then run `npm install @nhsdigital/nhs-notify-event-schemas-template-management`

## Events

- `TemplateCompleted`
- `TemplateDeleted`
- `TemplateDrafted`

## Usage

### Zod Validators

Zod validators for each event type are exported along with an accompanying type definition:

```ts
import {
  $TemplateCompletedEvent,
  $TemplateDeletedEvent,
  $TemplateDraftedEvent,
  type TemplateCompletedEvent,
  type TemplateDeletedEvent,
  type TemplateDraftedEvent,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';

$TemplateCompletedEvent.parse(event);
$TemplateDeletedEvent.parse(event);
$TemplateDraftedEvent.parse(event);
```

### JSON Schemas

JSON Schema files for each event type are included in the package. These are generated from the Zod schemas and can be imported as follows:

```ts
import TemplateCompletedEventV1Schema from '@nhsdigital/nhs-notify-event-schemas-template-management/schemas/TemplateCompleted/v1.json';
import TemplateDeletedEventV1Schema from '@nhsdigital/nhs-notify-event-schemas-template-management/schemas/TemplateDeleted/v1.json';
import TemplateDraftedEventV1Schema from '@nhsdigital/nhs-notify-event-schemas-template-management/schemas/TemplateDrafted/v1.json';
```

### Sample Events

A number of sample event files are also included for each event type. These can be imported as follows:

```ts
import EmailTemplateCompletedEvent from '@nhsdigital/nhs-notify-event-schemas-template-management/examples/TemplateCompleted/v1/email.json';
import SmsTemplateDeletedEventV1Schema from '@nhsdigital/nhs-notify-event-schemas-template-management/examples/TemplateDeleted/v1/sms.json';
import NhsAppTemplateDraftedEventV1Schema from '@nhsdigital/nhs-notify-event-schemas-template-management/examples/TemplateDrafted/v1/nhsapp.json';
```
