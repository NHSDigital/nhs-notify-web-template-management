import { getMessagePlanTemplateIds } from '@utils/get-message-plan-template-ids';
import type { RoutingConfig } from 'nhs-notify-backend-client';

describe('getMessagePlanTemplateIds', () => {
  it('should collect unique template IDs from defaults and conditionals', () => {
    const plan: Pick<RoutingConfig, 'cascade'> = {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: 'template-1',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          conditionalTemplates: [
            { templateId: 'template-2', language: 'fr' },
            { templateId: 'template-3', language: 'fr' },
          ],
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: 'template-1',
          conditionalTemplates: [{ templateId: 'template-2', language: 'fr' }],
        },
      ],
    };

    const ids = [...getMessagePlanTemplateIds(plan)].sort();
    expect(ids).toEqual(['template-1', 'template-2', 'template-3']);
  });

  it('should return empty set when there are no templates', () => {
    const plan: Pick<RoutingConfig, 'cascade'> = {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
    };
    const ids = getMessagePlanTemplateIds(plan);
    expect(ids.size).toBe(0);
  });
});
