import { z } from 'zod/v4';
import type {
  CascadeGroup,
  CascadeGroupAccessible,
  CascadeGroupName,
  CascadeGroupStandard,
  CascadeGroupTranslations,
  CascadeItem,
  CascadeItemBase,
  Channel,
  ChannelType,
  ConditionalTemplateAccessible,
  ConditionalTemplateLanguage,
  CreateUpdateRoutingConfig,
  RoutingConfig,
  RoutingConfigStatus,
  RoutingConfigStatusActive,
} from '../types/generated';
import { schemaFor } from './schema-for';
import { $Language, $LetterType } from './template-schema';
import {
  CASCADE_GROUP_NAME_LIST,
  CHANNEL_LIST,
  CHANNEL_TYPE_LIST,
  ROUTING_CONFIG_STATUS_LIST,
} from './union-lists';

const $CascadeGroupName = schemaFor<CascadeGroupName>()(
  z.enum(CASCADE_GROUP_NAME_LIST)
);

const $CascadeGroupAccessible = schemaFor<CascadeGroupAccessible>()(
  z.object({
    name: z.literal('accessible'),
    accessibleFormat: z.array($LetterType).nonempty(),
  })
).strict();

const $CascadeGroupTranslations = schemaFor<CascadeGroupTranslations>()(
  z.object({
    name: z.literal('translations'),
    language: z.array($Language).nonempty(),
  })
).strict();

const $CascadeGroupStandard = schemaFor<CascadeGroupStandard>()(
  z.object({
    name: z.literal('standard'),
  })
).strict();

const $CascadeGroup = schemaFor<CascadeGroup>()(
  z.discriminatedUnion('name', [
    $CascadeGroupAccessible,
    $CascadeGroupTranslations,
    $CascadeGroupStandard,
  ])
);

export const $Channel = schemaFor<Channel>()(z.enum(CHANNEL_LIST));

const $ChannelType = schemaFor<ChannelType>()(z.enum(CHANNEL_TYPE_LIST));

const $ConditionalTemplateLanguage = schemaFor<ConditionalTemplateLanguage>()(
  z.object({
    language: $Language,
    templateId: z.string().nonempty().nullable(),
  })
);

const $ConditionalTemplateAccessible =
  schemaFor<ConditionalTemplateAccessible>()(
    z.object({
      accessibleFormat: $LetterType,
      templateId: z.string().nonempty().nullable(),
    })
  );

const $CascadeItemBase = schemaFor<CascadeItemBase>()(
  z.object({
    cascadeGroups: z.array($CascadeGroupName),
    channel: $Channel,
    channelType: $ChannelType,
  })
);

const $CascadeItem = schemaFor<CascadeItem>()(
  $CascadeItemBase.and(
    z.union([
      z.object({
        defaultTemplateId: z.string().nonempty().nullable(),
        conditionalTemplates: z
          .array(
            z.union([
              $ConditionalTemplateAccessible,
              $ConditionalTemplateLanguage,
            ])
          )
          .optional(),
      }),
      z.object({
        defaultTemplateId: z.string().nonempty().nullable().optional(),
        conditionalTemplates: z.array(
          z.union([
            $ConditionalTemplateAccessible,
            $ConditionalTemplateLanguage,
          ])
        ),
      }),
    ])
  )
);

export const $CreateUpdateRoutingConfig =
  schemaFor<CreateUpdateRoutingConfig>()(
    z.object({
      campaignId: z.string(),
      cascade: z.array($CascadeItem).nonempty(),
      cascadeGroupOverrides: z.array($CascadeGroup).nonempty(),
      name: z.string(),
    })
  );

const $RoutingConfigStatus = schemaFor<RoutingConfigStatus>()(
  z.enum(ROUTING_CONFIG_STATUS_LIST)
);

const $RoutingConfigStatusActive = schemaFor<RoutingConfigStatusActive>()(
  $RoutingConfigStatus.exclude(['DELETED'])
);

export const $RoutingConfig = schemaFor<RoutingConfig>()(
  z.object({
    campaignId: z.string(),
    cascade: z.array($CascadeItem).nonempty(),
    cascadeGroupOverrides: z.array($CascadeGroup).nonempty(),
    name: z.string(),
    clientId: z.string(),
    id: z.uuidv4(),
    status: $RoutingConfigStatus,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
);

export type ListRoutingConfigFilters = {
  status?: RoutingConfigStatusActive;
};

export const $ListRoutingConfigFilters = schemaFor<ListRoutingConfigFilters>()(
  z.object({
    status: $RoutingConfigStatusActive.optional(),
  })
);
