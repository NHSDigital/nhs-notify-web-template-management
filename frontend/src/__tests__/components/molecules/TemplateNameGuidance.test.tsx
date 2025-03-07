import { render } from '@testing-library/react';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import content from '@content/content';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';

describe('TemplateNameGuidance component', () => {
  it('renders component correctly as TemplateNameGuidance', () => {
    const container = render(<TemplateNameGuidance template={'NHS_APP'} />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it.each(TEMPLATE_TYPE_LIST)(
    'should correctly display the template naming example when templateType is %s',
    (templateType) => {
      const expectedText =
        content.components.nameYourTemplate.templateNameDetailsExample[
          templateType
        ];

      const container = render(
        <TemplateNameGuidance template={templateType} />
      );

      expect(
        container.getByTestId('template-name-example').textContent
      ).toEqual(expectedText);
    }
  );
});
