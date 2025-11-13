import type { CascadeItem } from 'nhs-notify-backend-client';
import { getCascadeTemplateIds } from '../../domain/get-cascade-template-ids';

describe('getCascadeTemplateIds', () => {
  it('should return empty array when cascade is empty', () => {
    const cascade: CascadeItem[] = [];
    const result = getCascadeTemplateIds(cascade);
    expect(result).toEqual([]);
  });

  it('should return default template id when cascade item has only default template', () => {
    const cascade: CascadeItem[] = [
      {
        defaultTemplateId: 'template-1',
      } as CascadeItem,
    ];
    const result = getCascadeTemplateIds(cascade);
    expect(result).toEqual(['template-1']);
  });

  it('should return conditional template ids when cascade item has conditional templates', () => {
    const cascade: CascadeItem[] = [
      {
        conditionalTemplates: [
          { templateId: 'template-1' },
          { templateId: 'template-2' },
        ],
      } as CascadeItem,
    ];
    const result = getCascadeTemplateIds(cascade);
    expect(result).toEqual(['template-1', 'template-2']);
  });

  it('should return both default and conditional template ids from multiple cascade items', () => {
    const cascade: CascadeItem[] = [
      {
        defaultTemplateId: 'template-1',
      } as CascadeItem,
      {
        conditionalTemplates: [
          { templateId: 'template-2' },
          { templateId: 'template-3' },
        ],
      } as CascadeItem,
    ];
    const result = getCascadeTemplateIds(cascade);
    expect(result).toEqual(['template-1', 'template-2', 'template-3']);
  });

  it('should remove duplicate template ids', () => {
    const cascade: CascadeItem[] = [
      {
        defaultTemplateId: 'template-1',
      } as CascadeItem,
      {
        conditionalTemplates: [
          { templateId: 'template-1' },
          { templateId: 'template-2' },
        ],
      } as CascadeItem,
    ];
    const result = getCascadeTemplateIds(cascade);
    expect(result).toEqual(['template-1', 'template-2']);
  });

  it('should filter out null default template ids', () => {
    const cascade: CascadeItem[] = [
      {
        defaultTemplateId: null,
      } as CascadeItem,
      {
        defaultTemplateId: 'template-1',
      } as CascadeItem,
    ];
    const result = getCascadeTemplateIds(cascade);
    expect(result).toEqual(['template-1']);
  });

  it('should handle cascade items with both conditional and default templates', () => {
    const cascade: CascadeItem[] = [
      {
        defaultTemplateId: 'template-1',
        conditionalTemplates: [{ templateId: 'template-2' }],
      } as CascadeItem,
    ];
    const result = getCascadeTemplateIds(cascade);
    expect(result).toEqual(['template-1', 'template-2']);
  });
});
