import { render } from '@testing-library/react';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';

describe('TemplateNameGuidance component', () => {
  it('renders component correctly when template type is not given', () => {
    expect(render(<TemplateNameGuidance />).asFragment()).toMatchSnapshot();
  });

  it.each(TEMPLATE_TYPE_LIST)(
    'renders component correctly when template type is %s',
    (templateType) => {
      expect(
        render(
          <TemplateNameGuidance templateType={templateType} />
        ).asFragment()
      ).toMatchSnapshot();
    }
  );
});
