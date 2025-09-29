import type { RoutingConfig } from 'nhs-notify-backend-client';

export const routingConfig: RoutingConfig = {
  campaignId: 'campaign-1',
  clientId: 'client-1',
  cascade: [
    {
      cascadeGroups: ['standard'],
      channel: 'NHSAPP',
      channelType: 'primary',
      defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
    },
  ],
  cascadeGroupOverrides: [{ name: 'standard' }],
  id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
  status: 'DRAFT',
  name: 'Test config',
  createdAt: '2025-09-18T15:26:04.338Z',
  updatedAt: '2025-09-18T15:26:04.338Z',
  updatedBy: 'user-1',
};
