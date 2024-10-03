import { render } from '@testing-library/react';
import { NameYourTemplate } from '@molecules/NameYourTemplate';
import { TemplateType } from '@utils/types';
import { nameYourTemplateContent } from '@content/content';

describe('NameYourTemplate component', () => {
  const templateTypes = Object.keys(TemplateType);

  it('renders component correctly as NameYourTemplate', () => {
    const container = render(
      <NameYourTemplate template={TemplateType.NHS_APP} />
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
        <NameYourTemplate template={templateTypeToUse} />
      );

      expect(
        container.getByTestId('template-name-example').textContent
      ).toEqual(expectedText);
    }
  );
});
