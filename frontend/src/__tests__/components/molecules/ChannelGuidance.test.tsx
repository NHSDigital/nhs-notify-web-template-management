import { render } from '@testing-library/react';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';

describe('ChannelGuidance component', () => {
  it.each(TEMPLATE_TYPE_LIST)(
    'should correctly render the component for templateType %s',
    (templateType: string) => {
      const container = render(<ChannelGuidance template={templateType} />);

      expect(container.asFragment()).toMatchSnapshot();
    }
  );
});
