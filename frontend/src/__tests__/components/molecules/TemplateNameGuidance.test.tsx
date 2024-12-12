import { render } from '@testing-library/react';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { TemplateType } from 'nhs-notify-web-template-management-utils';
import { nameYourTemplateContent } from '@content/content';

describe('TemplateNameGuidance component', () => {
  const templateTypes = Object.keys(TemplateType);

  it('renders component correctly as TemplateNameGuidance', () => {
    const container = render(
      <TemplateNameGuidance template={TemplateType.NHS_APP} />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it.each(templateTypes)(
    'should correctly display the template naming example when templateType is %s',
    (templateType: string) => {
      const templateTypeToUse = templateType as TemplateType;
      const expectedText =
        nameYourTemplateContent.templateNameDetailsExample[templateTypeToUse];

      const container = render(
        <TemplateNameGuidance template={templateTypeToUse} />
      );

      expect(
        container.getByTestId('template-name-example').textContent
      ).toEqual(expectedText);
    }
  );
});
