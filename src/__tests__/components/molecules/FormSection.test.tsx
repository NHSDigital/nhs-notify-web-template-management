import { render } from '@testing-library/react';
import { FormSection } from '@molecules/FormSection/FormSection';

test('Renders form section', () => {
  const container = render(
    <FormSection>
      <input id='input' value='4' readOnly />
    </FormSection>
  );

  expect(container.asFragment()).toMatchSnapshot();
});
