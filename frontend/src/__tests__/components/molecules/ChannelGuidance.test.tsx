import { render } from '@testing-library/react';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { TemplateType } from 'nhs-notify-web-template-management-utils';

describe('ChannelGuidance component', () => {
  const templateTypes = Object.values(TemplateType);

  it.each(templateTypes)(
    'should correctly render the component for templateType %s',
    (templateType: string) => {
      const templateTypeToUse = templateType as TemplateType;

      const container = render(
        <ChannelGuidance template={templateTypeToUse} />
      );

      expect(container.asFragment()).toMatchSnapshot();
    }
  );
});
