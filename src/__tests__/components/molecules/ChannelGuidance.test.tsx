import { render } from '@testing-library/react';
import {
  ChannelGuidance,
  TemplateTypeNoLetters,
} from '@molecules/ChannelGuidance/ChannelGuidance';
import { TemplateType } from '@utils/enum';

describe('ChannelGuidance component', () => {
  const templateTypesWithoutLetter = Object.values(TemplateType).filter(
    (type) => type !== TemplateType.LETTER
  );

  it.each(templateTypesWithoutLetter)(
    'should correctly render the component for templateType %s',
    (templateType: string) => {
      const templateTypeToUse = templateType as TemplateTypeNoLetters;

      const container = render(
        <ChannelGuidance template={templateTypeToUse} />
      );

      expect(container.asFragment()).toMatchSnapshot();
    }
  );
});
