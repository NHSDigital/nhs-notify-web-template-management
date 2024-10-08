import { render } from '@testing-library/react';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';

test('Renders back button', () => {
  const container = render(
    <NHSNotifyBackButton formId='form-id' action='/action'>
      <input id='input' value='4' readOnly />
    </NHSNotifyBackButton>
  );

  expect(container.asFragment()).toMatchSnapshot();
});
