import { z } from 'zod';
import { languages } from './common';

export const $RoutingConfigEventChannel = z.enum([
  'NHS_APP',
  'EMAIL',
  'SMS',
  'LETTER',
]);

export const $RoutingConfigStatus = z.enum(['DELETED', 'DRAFT', 'COMPLETED']);

const accessibleFormats = ['x1'];

export type RoutingConfigEventChannel = z.infer<
  typeof $RoutingConfigEventChannel
>;

export const $RoutingConfigEventChannelType = z.enum(['primary', 'secondary']);
export type RoutingConfigEventChannelType = z.infer<
  typeof $RoutingConfigEventChannelType
>;

const $RoutingConfigEventConditionalTemplate = z
  .object({
    language: z.enum(languages).optional().meta({
      description: 'Language override for the template',
    }),
    accessibleFormat: z.enum(accessibleFormats).optional().meta({
      description: 'Communication preference override for the template',
    }),
    supplierReferences: z.record(z.string(), z.string()).optional().meta({
      description: 'Supplier references that identify the template',
    }),
    templateId: z
      .string()
      // eslint-disable-next-line security/detect-unsafe-regex
      .regex(/^[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/)
      .meta({
        description: 'Unique identifier for the template',
      }),
  })
  .meta({
    id: 'ConditionalTemplate',
  });
export type RoutingConfigEventConditionalTemplate = z.infer<
  typeof $RoutingConfigEventConditionalTemplate
>;

const $CascadeItem = z
  .object({
    channel: $RoutingConfigEventChannel.meta({
      description: 'Communication type for this cascade item',
    }),
    channelType: $RoutingConfigEventChannelType.meta({
      description: 'Channel type for this cascade item',
    }),
    defaultTemplateId: z
      .string()
      // eslint-disable-next-line security/detect-unsafe-regex
      .regex(/^[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/)
      .optional()
      .meta({
        description:
          'Unique identifier for the template to use if no conditions for conditionalTemplates are satisfied',
      }),
    supplierReferences: z.record(z.string(), z.string()).optional().meta({
      description: 'Supplier references that identify the template',
    }),
    conditionalTemplates: z
      .array($RoutingConfigEventConditionalTemplate)
      .optional(),
    cascadeGroups: z.array(z.string()).meta({
      description:
        'List of cascade groups that the cascade item will be included in',
    }),
  })
  .meta({
    id: 'CascadeItem',
  });
export type CascadeItem = z.infer<typeof $CascadeItem>;

const $CascadeGroupOverride = z
  .object({
    name: z.string(),
    accessibleFormat: z.array(z.string()).optional(),
    language: z.array(z.string()).optional(),
  })
  .meta({
    id: 'CascadeGroupOverride',
  });
export type CascadeGroupOverride = z.infer<typeof $CascadeGroupOverride>;

export const $RoutingConfigEventV1Data = z.object({
  clientId: z.string().meta({
    description: 'The client that owns the routing config',
  }),
  campaignId: z.string().meta({
    description: 'The campaign that is associated with the routing config',
  }),
  id: z
    .string()
    .meta({
      description: 'Unique identifier of the routing config',
    })
    // eslint-disable-next-line security/detect-unsafe-regex
    .regex(/^[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/),
  name: z.string().meta({
    description: 'User-provided name identifying the routing config',
  }),
  defaultCascadeGroup: z.string().meta({
    description: 'Default cascade group name',
  }),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    .meta({
      description: 'Timestamp for when the routing config was created',
    }),
  cascade: z.array($CascadeItem).meta({
    description:
      'Array defining the order of channels for the routing config and how they are configured',
  }),
  cascadeGroupOverrides: z.array($CascadeGroupOverride).meta({
    description:
      'Config defining non-default cascade groups and the conditons under which they will be used',
  }),
  status: $RoutingConfigStatus.meta({
    description: 'Routing config status',
  }),
});
